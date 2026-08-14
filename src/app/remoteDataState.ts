export type RemoteDataState = 'loading' | 'error' | 'empty' | 'content';

type DeriveRemoteDataStateOptions<Data> = {
  data: Data | undefined;
  isEmpty: (data: Data) => boolean;
  isError: boolean;
};

export const deriveRemoteDataState = <Data>({
  data,
  isEmpty,
  isError,
}: DeriveRemoteDataStateOptions<Data>): RemoteDataState => {
  if (data !== undefined) {
    return isEmpty(data) ? 'empty' : 'content';
  }

  return isError ? 'error' : 'loading';
};
