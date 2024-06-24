'use client'
import React from 'react';
import Image from 'next/image';
import { useAuth } from '../../../_providers/Auth';
import classes from './index.module.scss';

export const UserInfo = () => {
  const { user } = useAuth()

  // Assuming user.profileImageUrl is where you store the image URL in your user object
  const profileImageUrl = user?.pictureURL || '/assets/icons/profile.svg';

  return (
    <div className={classes.profile}>
      <div className={classes.profileImageWrapper}>
        <Image
          src={profileImageUrl}
          alt="profile"
          width={50}
          height={50}
          className={classes.profileImage}
        />
      </div>

      <div className={classes.profileInfo}>
        <p className={classes.name}>{user?.name}</p>
        <p className={classes.email}>{user?.email}</p>
      </div>
    </div>
  );
};
