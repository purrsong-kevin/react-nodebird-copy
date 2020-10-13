import React from 'react';
import Head from 'next/head';

import AppLayout from '../components/AppLayout';
import NicknameEditForm from '../components/NicknameEditForm';
import FollowList from '../components/FollowList';

const Profile = () => {
  const followingList = [{ nickname: '케빈' }, { nickname: '진원부하은총' }, { nickname: '진원은영원한은총의신' }];
  const followerList = [{ nickname: '케빈' }, { nickname: '진원부하은총' }, { nickname: '진원은영원한은총의신' }];

  return (
    <>
      <Head>
        <title>My Profile | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="Following List" data={followingList} />
        <FollowList header="Follower List" data={followerList} />
      </AppLayout>
    </>
  );
};

export default Profile;
