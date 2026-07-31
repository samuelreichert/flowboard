import { Children, Fragment } from 'react';
import type { ReactNode } from 'react';

type ActionGroupProps = {
  children: ReactNode;
  className?: string;
};

const ActionGroup = ({ children, className }: ActionGroupProps) => {
  const actions = Children.toArray(children);

  return (
    <div className={['icon-button-group', className].filter(Boolean).join(' ')}>
      {actions.map((action, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span aria-hidden="true" className="icon-button-group__separator" />
          )}
          {action}
        </Fragment>
      ))}
    </div>
  );
};

export default ActionGroup;
