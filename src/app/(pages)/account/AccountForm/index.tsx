'use client'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Button } from '../../../_components/Button';
import { Input } from '../../../_components/Input';
import { Message } from '../../../_components/Message';
import { useAuth } from '../../../_providers/Auth';

import classes from './index.module.scss';

type FormData = {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
  profilephoto: FileList;
};

const AccountForm: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, setUser } = useAuth();
  const [changePassword, setChangePassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | ArrayBuffer | null>(null);
  const [photoName, setPhotoName] = useState<string>(''); // State to hold the photo name

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    reset,
    watch,
  } = useForm<FormData>();

  const password = useRef({});
  password.current = watch('password', '');

  const router = useRouter();

  // Function to fetch user data, including the photo name, when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch user data including photo name
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setPhotoName(userData.profilephoto); // Set the photo name in the state
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSuccess('Image uploaded successfully.');

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (user) {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('name', data.name);
        formData.append('password', data.password);
        formData.append('passwordConfirm', data.passwordConfirm);

        if (data.profilephoto && data.profilephoto.length > 0) {
          formData.append('profilephoto', data.profilephoto[0].name);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          credentials: 'include',
          method: 'PATCH',
          body: formData,
        });

        if (response.ok) {
          const json = await response.json();
          setUser(json.doc);
          setSuccess('Successfully updated account.');
          setError('');
          setChangePassword(false);
          setSelectedImage(null);
          reset({
            email: json.doc.email,
            name: json.doc.name,
            password: '',
            passwordConfirm: '',
            profilephoto: new DataTransfer().files,
          });
        } else {
          setError('There was a problem updating your account.');
        }
      }
    },
    [user, setUser, reset]
  );

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent('You must be logged in to view this page.')}&redirect=${encodeURIComponent(
          '/account'
        )}`
      );
    }

    if (user) {
      reset({
        email: user.email,
        name: user.name,
        password: '',
        passwordConfirm: '',
        profilephoto: new DataTransfer().files,
      });
    }
  }, [user, router, reset, changePassword]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
      <Message error={error} success={success} className={classes.message} />
      {!changePassword ? (
        <Fragment>
          <Input name="email" label="Email Address" required register={register} error={errors.email} type="email" />
          <Input name="name" label="Name" register={register} error={errors.name} />
          <input
            type="file"
            accept="image/*"
            {...register('profilephoto')}
            onChange={handleImageUpload}
          />
          {selectedImage && (
            <img
              src={selectedImage as string}
              alt="Profile"
              style={{ marginTop: '20px', maxWidth: '100%', height: 'auto' }}
            />
          )}
          {photoName && (
            <img src={photoName} alt="Profile" /> // Display the photo using its URL
          )}
          <p>
            {'Change your account details below, or '}
            <button
              type="button"
              className={classes.changePassword}
              onClick={() => setChangePassword(!changePassword)}
            >
              click here
            </button>
            {' to change your password.'}
          </p>
        </Fragment>
      ) : (
        <Fragment>
          <p>
            {'Change your password below, or '}
            <button
              type="button"
              className={classes.changePassword}
              onClick={() => setChangePassword(!changePassword)}
            >
              cancel
            </button>
            .
          </p>
          <Input
            name="password"
            type="password"
            label="Password"
            required
            register={register}
            error={errors.password}
          />
          <Input
            name="passwordConfirm"
            type="password"
            label="Confirm Password"
            required
            register={register}
            validate={(value) =>
              value === password.current || 'The passwords do not match'
            }
            error={errors.passwordConfirm}
          />
        </Fragment>
      )}
      <Button
        type="submit"
        label={isLoading ? 'Processing' : changePassword ? 'Change Password' : 'Update Account'}
        disabled={isLoading}
        appearance="primary"
        className={classes.submit}
      />
    </form>
  );
};

export default AccountForm;
