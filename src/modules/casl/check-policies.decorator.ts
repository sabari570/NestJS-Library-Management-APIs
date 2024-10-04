// *****************************
// THIS IS A CUSTOM DECORATOR CREATED TO CHECK WHETHER THE USER HAS THE PERMISSION TO
// ACCESS THIS PARTICULAR ROUTE
// ****************************
import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { Action } from "./enums/actions.enum";
import { Subject } from "./enums/subjects.enum";

// Just a variable to hold the type of argument received in the function
export type RequiredPermission = [Action, Subject];

// This is the key to store & retrieve the permissions list being passed
export const PERMISSION_CHECKER_KEY = 'permission_checker_params_key';

// This is the function which accepts the list of permission rules being passed
// and returns a custom decorator of type string after setting the metaData

// * This attaches the permissions as metadata to the route handler (or class). 
// * Later, you can retrieve this metadata (e.g., in a guard) to check if the current user has the required permissions.
// The params object contains a list of actions(permissions) that an user is allowed to perform
// so it sets the metaData with that data
export const CheckPermissions =
    (...params: RequiredPermission[]): CustomDecorator<string> => SetMetadata(PERMISSION_CHECKER_KEY, params);
