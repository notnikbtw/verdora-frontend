import { useState } from 'react';
import TextField from '@components/common/forms/TextField';
import EyeOpenIcon from '@assets/icons/eye-open.svg?react';
import EyeClosedIcon from '@assets/icons/eye-close.svg?react';

type Props = Omit<
  React.ComponentProps<typeof TextField>,
  'type' | 'rightIcon' | 'onRightIconClick'
>;

const PasswordField = (props: Props) => {
  const [show, setShow] = useState(false);

  return (
    <TextField
      {...props}
      type={show ? 'text' : 'password'}
      rightIcon={
        show ? (
          <EyeOpenIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer" />
        ) : (
          <EyeClosedIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer" />
        )
      }
      onRightIconClick={() => setShow(prev => !prev)}
    />
  );
};

export default PasswordField;
