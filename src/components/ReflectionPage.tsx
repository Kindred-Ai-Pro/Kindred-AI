import { type ReactNode } from 'react';

type ReflectionPageProps = {
  children?: ReactNode;
  chatBox?: ReactNode;
};

export function ReflectionPage({ children, chatBox }: ReflectionPageProps) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      {children}
      {chatBox ? <div className="mt-8">{chatBox}</div> : null}
    </div>
  );
}
