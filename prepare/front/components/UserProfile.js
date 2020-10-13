import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Card, Avatar, Button } from 'antd';

const UserProfile = ({ setIsLoggedIn }) => {
  const onLogout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  return (
    <Card
      actions={[
        <div key="twit">Twit<br />0</div>,
        <div key="followings">Followings<br />0</div>,
        <div key="followers">Followers<br />0</div>
      ]}
    >
      <Card.Meta
        avatar={<Avatar>KV</Avatar>}
        title="Kevin"
      />
      <Button onClick={onLogout}>Logout</Button>
    </Card>
  );
};

UserProfile.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired
};

export default UserProfile;
