import { User } from "lucide-react";

type UserMessageProps = {
  message: string;
  chatId?: string;
};
export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  chatId,
}) => {
  return (
    <div className={"group relative flex items-start"}>
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-primary text-primary-foreground overflow-hidden">
        <User size={18} />
      </div>
      <div className="ml-4 flex-1 overflow-hidden px-1">
        <p className="bg-muted rounded-md p-4 text-foreground/80 whitespace-pre-wrap">
          {message}
        </p>
      </div>
    </div>
  );
};
