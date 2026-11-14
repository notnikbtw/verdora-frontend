import { useState } from 'react';
import TextField from '@components/common/forms/TextField';
import { Eye, EyeOff } from 'lucide-react';

type Props = Omit<
  React.ComponentProps<typeof TextField>,
  'type' | 'rightIcon' | 'onRightIconClick'
>;

const PasswordField = (props: Props) => {
  const [show, setShow] = useState(false);

  return (
    <TextField
      {...props}
      autoComplete={props.autoComplete ?? 'current-password'}
      rightIconLabel={show ? 'Hide password' : 'Show password'}
      type={show ? 'text' : 'password'}
      rightIcon={
        show ? (
          <EyeOff aria-hidden="true" className="size-5 text-zinc-400" />
        ) : (
          <Eye aria-hidden="true" className="size-5 text-zinc-400" />
        )
      }
      onRightIconClick={() => setShow(prev => !prev)}
    />
  );
};

export default PasswordField;
