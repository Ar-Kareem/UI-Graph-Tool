import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

const API = {
    usersAdd: '/api/usersAdd/',
    usersGet: '/api/usersGet/',

    storyAdd: '/api/storyAdd',
    storyGet: '/api/storyGet',
    storyGetAll: '/api/storyGetAll',

    userAnnotationAdd: '/api/userAnnotationAdd',
    userAnnotationGet: '/api/userAnnotationGet',
}

@Injectable()
export class AppService {
    constructor(private http: HttpClient) { }

    usersAdd(user) {
        return this.http.post(API.usersAdd, {'data': user});
    }

    usersGet() {
        return this.http.post(API.usersGet, {});
    }

    storyAdd(story) {
        return this.http.post(API.storyAdd, {'data': story});
    }

    storyGet(storyNum) {
        return this.http.post(API.storyGet, {'data': storyNum});
    }

    storyGetAll() {
        return this.http.post(API.storyGetAll, {});
    }

    userAnnotationAdd(user, storyNum, jsonGraph) {
        return this.http.post(API.userAnnotationAdd, {'user': user, 'storyNum': storyNum, 'data': JSON.stringify(jsonGraph)});
    }

    userAnnotationGet(user, storyNum) {
        return this.http.post(API.userAnnotationGet, {'user': user, 'storyNum': storyNum});
    }


}
