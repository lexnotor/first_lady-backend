import {
    ExecutionContext,
    SetMetadata,
    createParamDecorator,
} from "@nestjs/common";
import { Request } from "express";
import { RoleType } from "../user/user.entity";

type UserIdentity = {
    id: string;
    username: string;
    generated: string;
    n_v: string;
    shop?: string;
    roles?: RoleType[];
};

const User = createParamDecorator<void, ExecutionContext, UserIdentity>(
    (_, context) => {
        const request = context
            .switchToHttp()
            .getRequest<Request & { user: UserIdentity }>();
        return { roles: [], ...request.user };
    }
);

const ROLE_KEY = "ROLES_ACCESS";
const HasRole = (...roles: RoleType[]) => SetMetadata(ROLE_KEY, roles);

export { User, UserIdentity, HasRole, ROLE_KEY };
