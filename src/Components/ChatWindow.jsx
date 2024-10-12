import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { MessageSquareText, PlusIcon, SendIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
// useParams
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { useAuth } from './AuthContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage

function ChatWindow() {
  const params = useParams();
  const [secondUser, setSecondUser] = useState();
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null); // State to hold the selected file
  const receiverId = params.chatid;
  const [msgList, setMsgList] = useState([]);
  const { userData } = useAuth();
  const storage = getStorage(); // Initialize Firebase Storage

  const chatId =
    userData?.id > receiverId
      ? `${userData.id}-${receiverId}`
      : `${receiverId}-${userData?.id}`;

  useEffect(() => {
    const getUser = async () => {
      const docRef = doc(db, "users", receiverId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSecondUser(docSnap.data());
      }
    };

    const msgUnsubscribe = onSnapshot(doc(db, "user-chats", chatId), (doc) => {
      setMsgList(doc.data()?.messages || []);
    });

    getUser();

    return () => {
      msgUnsubscribe();
    };
  }, [receiverId]);

  const uploadFile = async (file) => {
    const storageRef = ref(storage, `chat-files/${chatId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef); // Return the download URL of the uploaded file
  };

  const sendMsg = async () => {
    if (!msg && !file) return; // No message or file, so exit

    const date = new Date();
    const timeStamp = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    let messageData = {
      text: msg || null, // If there’s no text, set it to null
      time: timeStamp,
      sender: userData.id,
      receiver: receiverId,
      fileUrl: null, // Initial placeholder for file URL
      fileType: null // Placeholder for file type (image, document, etc.)
    };

    // Handle file upload if a file is selected
    if (file) {
      const fileUrl = await uploadFile(file);
      messageData.fileUrl = fileUrl;
      messageData.fileType = file.type.startsWith("image/") ? "image" : "file";
      setFile(null); // Clear the file after sending
    }

    if (msgList?.length === 0) {
      await setDoc(doc(db, "user-chats", chatId), {
        chatId: chatId,
        messages: [messageData],
      });
    } else {
      await updateDoc(doc(db, "user-chats", chatId), {
        messages: arrayUnion(messageData),
      });
    }
    setMsg("");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  if (!receiverId)
    return (
      <section className="w-[70%] h-full flex flex-col gap-4 items-center justify-center">
        <MessageSquareText
          className="w-28 h-28 text-gray-400"
          strokeWidth={1.2}
        />
        <p className="text-sm text-center text-gray-400">
          select any contact to
          <br />
          start a chat with.
        </p>
      </section>
    );

  return (
    <section className="w-[70%] h-full flex flex-col gap-4 items-center justify-center">
      <div className="h-full w-full bg-chat-bg flex flex-col">
        <div className="bg-background py-2 px-4 flex items-center gap-2 shadow-sm">
          <img
            src={secondUser?.profile_pic || "/default-user.png"}
            alt="profile picture"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <h3>{secondUser?.name}</h3>
            {secondUser?.lastSeen && (
              <p className="text-xs text-neutral-400">
                last seen at {secondUser?.lastSeen}
              </p>
            )}
          </div>
        </div>
        <div className="flex-grow flex flex-col gap-12 p-6 overflow-y-scroll">
          {msgList?.map((m, index) => (
            <div
              key={index}
              data-sender={m.sender === userData.id}
              className={`bg-white w-fit rounded-md p-2 shadow-sm max-w-[400px] break-words data-[sender=true]:ml-auto data-[sender=true]:bg-primary-light`}
            >
              {m?.text && <p>{m?.text}</p>}
              {m?.fileUrl && (
                <div>
                  {m.fileType === "image" ? (
                    <img src={m.fileUrl} alt="file" className="max-w-full" />
                  ) : (
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      Download File
                    </a>
                  )}
                </div>
              )}
              <p className="text-xs text-neutral-500 text-end">{m?.time}</p>
            </div>
          ))}
        </div>
        <div className="bg-background py-3 px-6 shadow flex items-center gap-6">
          <PlusIcon />
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />
          <label htmlFor="fileUpload" className="cursor-pointer">
            Attach File
          </label>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMsg();
              }
            }}
            className="w-full py-2 px-4 rounded focus:outline-none"
            placeholder="Type a message..."
          />
          <button onClick={sendMsg}>
            <SendIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ChatWindow;
