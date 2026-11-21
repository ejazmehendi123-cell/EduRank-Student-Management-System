import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  selectIsAuthenticated,
  selectIsRestoringSession,
  selectUserRole,
} from '../features/auth/authSelectors';
import { restoreSession } from '../features/auth/authThunks';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { TeacherNavigator } from './TeacherNavigator';
import { SplashScreen } from '../screens/common/SplashScreen';
import { ROLES } from '../utils/constants';

export const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isRestoringSession = useAppSelector(selectIsRestoringSession);
  const userRole = useAppSelector(selectUserRole);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (isRestoringSession) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : userRole === ROLES.TEACHER ? (
        <TeacherNavigator />
      ) : (
        <StudentNavigator />
      )}
    </NavigationContainer>
  );
};

