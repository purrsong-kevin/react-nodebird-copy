import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button } from 'antd'
import Link from 'next/link';
import styled from 'styled-components';
import useInput from './hooks/useInput';

const ButtonWrapper = styled.div`
  margin-top: 10px;
`;

const FormWrapper = styled(Form)`
  padding: 10px;
`;

const LoginForm = ({ setIsLoggedIn }) => {
  const [id, onChangeId] = useInput('');
  const [password, onChangePassword] = useInput('');

  const onSubmitForm = useCallback((e) => {
    // e.preventDefault(); 쓰면 안됨 antd Form의 onFinish에는 이미 적용되어 있음
    console.log("ID, Password", id, password);
    setIsLoggedIn(true);
  }, [id, password]);

  // const style = useMemo(() => ({ marginTop: 10 }), []);

  return (
    <FormWrapper onFinish={onSubmitForm}>
      <div>
        <label htmlFor="user-id">ID</label>
        <br />
        <Input name="user-id" value={id} onChange={onChangeId} required />
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
        <Button type="primary" htmlType="submit" loading={false}>Login</Button>
        <Link href="/signup"><a><Button>Signup</Button></a></Link>
      </ButtonWrapper>
    </FormWrapper>
  );
};

LoginForm.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired
};

export default LoginForm;
