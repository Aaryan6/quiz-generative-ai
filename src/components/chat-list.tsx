export function ChatList({ messages }: { messages: any[] }) {
  if (!messages.length) {
    return null;
  }
  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index} className="pb-4 prose">
          {message.display}
        </div>
      ))}
    </div>
  );
}
