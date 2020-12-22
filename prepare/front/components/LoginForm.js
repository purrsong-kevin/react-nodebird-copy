import React, { useCallback, useEffect, useMemo } from 'react';
import { Form, Input, Button } from 'antd'
import Link from 'next/link';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import useInput from '../hooks/useInput';
import { LOG_IN_REQUEST } from '../reducers/user';

const ButtonWrapper = styled.div`
  margin-top: 10px;
`;

const FormWrapper = styled(Form)`
  padding: 10px;
`;

const LoginForm = () => {
  const dispatch = useDispatch();
  const { logInLoading, logInError } = useSelector(state => state.user);

  const [email, onChangeEmail] = useInput('kevin@test.com');
  const [password, onChangePassword] = useInput('1234');

  useEffect(() => {
    if (logInError) {
      alert(logInError);
    }
  }, [logInError]);

  const onSubmitForm = useCallback((e) => {
    // e.preventDefault(); 쓰면 안됨 antd Form의 onFinish에는 이미 적용되어 있음
    dispatch({
      type: LOG_IN_REQUEST,
      data: { email, password }
    });
  }, [email, password]);

  // const style = useMemo(() => ({ marginTop: 10 }), []);

  return (
    <FormWrapper onFinish={onSubmitForm}>
      <div>
        <label htmlFor="user-email">E-mail</label>
        <br />
        <Input name="user-email" type="email" value={email} onChange={onChangeEmail} required />
      </div>
      <div>
        <label htmlFor="user-password">Password</label>
        <br />
        <Input
          name="user-password"
          value={password}
          onChange={onChangePassword}
          required
        />
      </div>
      <ButtonWrapper /* style={style} */>
        <Button type="primary" htmlType="submit" loading={logInLoading}>Login</Button>
        <Link href="/signup"><a><Button>Signup</Button></a></Link>
      </ButtonWrapper>
    </FormWrapper>
  );
};

export default LoginForm;
