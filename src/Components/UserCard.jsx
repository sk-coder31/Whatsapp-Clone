import React from 'react';
import { Link, useParams } from "react-router-dom";
import { useAuth } from './AuthContext';

function UserCard(props) {
    const params = useParams();
    const { userObject } = props;
    const isActive = params?.chatId === userObject.id;
    const {userData} = useAuth();
    return (
      
            <Link   to={`/${userObject.id}`}
                className={`flex gap-4 items-center justify-center hover:bg-background p-2 rounded cursor-pointer  ${isActive && "bg-background"
                    }`}
            >
                {/* Render user data here */}
            <img src={userObject.userData.profile_pic} alt="" className="w-12 h-12 object-cover rounded-full" />
                {/* ... other user data */}
                <h2 className='flex-grow'>{userData.email===userObject.userData.email?`${userObject.userData.name}(me)`:`${userObject.userData.name}`}</h2>
            </Link>
        
        
    )
}

export default UserCard