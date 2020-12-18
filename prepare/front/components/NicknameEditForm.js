import React, { useCallback, useMemo, useState } from 'react';
import { Form, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setAutoFreeze } from 'immer';
import useInput from '../hooks/useInput';
import { CHANGE_NICKNAME_REQUEST } from '../reducers/user';

const NicknameEditForm = () => {
  const dispatch = useDispatch();
  const { me } = useSelector(state => state.user);
  const [nickname, onChangeNickname] = useInput(me?.nickname || '');
  const style = useMemo(() => ({ marginBottom: '20px', border: '1px solid #d9d9d9', padding: '20px' }), []); 

  const onSubmit = useCallback(() => {
    dispatch({
      type: CHANGE_NICKNAME_REQUEST,
      data: nickname
    });
  }, [nickname]);

  return (
    <Form style={style}>
      <Input.Search
        value={nickname}
        onChange={onChangeNickname}
        addonBefore="Nickname"
        enterButton="Edit"
        onSearch={onSubmit}
      />
    </Form>
  );
};

export default NicknameEditForm;
