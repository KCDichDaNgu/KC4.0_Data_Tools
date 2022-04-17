import * as userEpics from './user/epic';

import { values } from 'lodash';
import { combineEpics } from 'redux-observable';
import { catchError } from 'rxjs/operators';

export const rootEpic = (action$, store$, dependencies) =>
    combineEpics(
        ...values(userEpics), 
    )(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            console.error(error);
            return source;
        }
    )
);
