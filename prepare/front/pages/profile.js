import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import Router from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';

import AppLayout from '../components/AppLayout';
import NicknameEditForm from '../components/NicknameEditForm';
import FollowList from '../components/FollowList';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

import userSWR from 'swr';
import { backUrl } from '../config/config';

const fetcher = url => axios.get(url, { withCredentials: true }).then(result => result.data);

const Profile = () => {
  const { me } = useSelector(state => state.user);
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);
  
  const { data: followingsData, error: followingError } = userSWR(`${backUrl}/user/followings?limit=${followingsLimit}`, fetcher);
  const { data: followersData, error: followerError } = userSWR(`${backUrl}/user/followers?limit=${followersLimit}`, fetcher);

  useEffect(() => {
    if (!(me && me.id)) {
      Router.push('/');
    }
  }, [me && me.id]);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit(prev => prev + 3);
  });

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit(prev => prev + 3);
  });

  if (!me) {
    return '내 정보 로딩 중...';
  }

  if (followerError || followingError) {
    console.log(followerError || followingError);
    return <div>팔로잉/팔로워 로딩 중 에러가 발생했습니다.</div>;
  }

 
  return (
    <>
      <Head>
        <title>My Profile | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="Following List" data={followingsData} onClickMore={loadMoreFollowings} loading={!followingsData && !followingError} />
        <FollowList header="Follower List" data={followersData} onClickMore={loadMoreFollowers} loading={!followersData && !followerError} />
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END);
  console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});

export default Profile;
