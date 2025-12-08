import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'solid' | 'outline';
}

export default function PrimaryButton({
  title,
  variant = 'solid',
  ...props
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      className={`px-6 py-3 rounded-lg ${
        variant === 'solid'
          ? 'bg-primary active:opacity-80'
          : 'border-2 border-primary active:bg-gray-100'
      }`}
      {...props}
    >
      <Text
        className={`text-center font-semibold ${
          variant === 'solid' ? 'text-white' : 'text-primary'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
