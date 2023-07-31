import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Request } from "express";

type UserIdentity = {
    id: string;
    username: string;
    email: string;
    types: string;
};

const User = createParamDecorator<void, ExecutionContext, UserIdentity>(
    (_, context) => {
        const request = context
            .switchToHttp()
            .getRequest<Request & { user: UserIdentity }>();
        return request.user;
    }
);

export { User, UserIdentity };
