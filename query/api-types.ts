/**
 * This is an auto-generated file, do not edit directly!
 * Run "yarn template" to generate this file.
 */
import type { SagaApi } from "./pipe.ts";
import type {
  ApiCtx,
  CreateAction,
  CreateActionWithPayload,
  FetchJson,
  MiddlewareApiCo,
  Next,
  Payload,
} from "./types.ts";

export type ApiName = string | string[];

export interface SagaQueryApi<Ctx extends ApiCtx = ApiCtx>
  extends SagaApi<Ctx> {
  request: (
    r: Partial<RequestInit>,
  ) => (ctx: Ctx, next: Next) => Iterator<any>;
  cache: () => (ctx: Ctx, next: Next) => Iterator<any>;

  uri: (uri: string) => {
    /**
     * Options only
     */
    get(req: { supervisor?: any }): CreateAction<Ctx>;
    get<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    get<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    get<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    get(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    get<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    get<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    get<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    get<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    get<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    get(req: { supervisor?: any }, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    get<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    get<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    get<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    get<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    get<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options only
     */
    post(req: { supervisor?: any }): CreateAction<Ctx>;
    post<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    post<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    post<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    post(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    post<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    post<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    post<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    post<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    post<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    post(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateAction<Ctx>;
    post<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    post<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    post<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    post<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    post<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options only
     */
    put(req: { supervisor?: any }): CreateAction<Ctx>;
    put<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    put<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    put<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    put(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    put<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    put<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    put<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    put<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    put<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    put(req: { supervisor?: any }, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    put<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    put<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    put<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    put<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    put<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options only
     */
    patch(req: { supervisor?: any }): CreateAction<Ctx>;
    patch<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    patch<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    patch<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    patch(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    patch<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    patch<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    patch<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    patch<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    patch<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    patch(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateAction<Ctx>;
    patch<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    patch<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    patch<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    patch<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    patch<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options only
     */
    delete(req: { supervisor?: any }): CreateAction<Ctx>;
    delete<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    delete<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    delete<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    delete(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    delete<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    delete<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    delete<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    delete<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    delete<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    delete(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateAction<Ctx>;
    delete<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    delete<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    delete<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    delete<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    delete<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options only
     */
    options(req: { supervisor?: any }): CreateAction<Ctx>;
    options<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    options<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    options<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    options(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    options<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    options<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    options<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    options<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    options<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    options(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateAction<Ctx>;
    options<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    options<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    options<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    options<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    options<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options only
     */
    head(req: { supervisor?: any }): CreateAction<Ctx>;
    head<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    head<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    head<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    head(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    head<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    head<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    head<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    head<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    head<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    head(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateAction<Ctx>;
    head<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    head<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    head<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    head<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    head<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options only
     */
    connect(req: { supervisor?: any }): CreateAction<Ctx>;
    connect<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    connect<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    connect<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    connect(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    connect<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    connect<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    connect<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    connect<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    connect<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    connect(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateAction<Ctx>;
    connect<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    connect<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    connect<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    connect<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    connect<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options only
     */
    trace(req: { supervisor?: any }): CreateAction<Ctx>;
    trace<P>(
      req: { supervisor?: any },
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    trace<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    trace<P, ApiSuccess, ApiError = any>(req: {
      supervisor?: any;
    }): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Middleware only
     */
    trace(fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
    trace<Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    trace<P>(
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    trace<P, Gtx extends Ctx = Ctx>(
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    trace<P extends never, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    trace<P, ApiSuccess, ApiError = any>(
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;

    /**
     * Options and Middleware
     */
    trace(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateAction<Ctx>;
    trace<Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateAction<Gtx>;
    trace<P>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
    ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
    trace<P, Gtx extends Ctx = Ctx>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Gtx>,
    ): CreateActionWithPayload<Gtx, P>;
    trace<P extends never, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
    ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
    trace<P, ApiSuccess, ApiError = any>(
      req: { supervisor?: any },
      fn: MiddlewareApiCo<Ctx>,
    ): CreateActionWithPayload<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>,
      P
    >;
  };

  /**
   * Only name
   */
  get(name: ApiName): CreateAction<Ctx>;
  get<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  get<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  get<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  get(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  get<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  get<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  get<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  get<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  get(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  get<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  get<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  get<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  get<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  get<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  get(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  get<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  get<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  get<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  get<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  get<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  post(name: ApiName): CreateAction<Ctx>;
  post<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  post<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  post<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  post(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  post<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  post<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  post<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  post<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  post(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  post<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  post<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  post<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  post<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  post<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  post(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  post<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  post<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  post<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  post<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  post<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  put(name: ApiName): CreateAction<Ctx>;
  put<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  put<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  put<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  put(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  put<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  put<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  put<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  put<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  put(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  put<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  put<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  put<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  put<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  put<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  put(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  put<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  put<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  put<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  put<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  put<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  patch(name: ApiName): CreateAction<Ctx>;
  patch<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  patch<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  patch<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  patch(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  patch<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  patch<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  patch<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  patch<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  patch(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  patch<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  patch<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  patch<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  patch<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  patch<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  patch(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  patch<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  patch<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  patch<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  patch<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  patch<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  delete(name: ApiName): CreateAction<Ctx>;
  delete<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  delete<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  delete<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  delete(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  delete<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  delete<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  delete<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  delete<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  delete(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  delete<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  delete<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  delete<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  delete<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  delete<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  delete(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  delete<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  delete<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  delete<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  delete<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  delete<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  options(name: ApiName): CreateAction<Ctx>;
  options<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  options<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  options<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  options(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  options<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  options<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  options<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  options<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  options(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  options<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  options<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  options<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  options<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  options<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  options(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  options<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  options<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  options<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  options<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  options<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  head(name: ApiName): CreateAction<Ctx>;
  head<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  head<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  head<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  head(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  head<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  head<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  head<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  head<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  head(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  head<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  head<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  head<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  head<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  head<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  head(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  head<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  head<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  head<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  head<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  head<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  connect(name: ApiName): CreateAction<Ctx>;
  connect<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  connect<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  connect<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  connect(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  connect<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  connect<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  connect<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  connect<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  connect(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  connect<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  connect<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  connect<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  connect<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  connect<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  connect(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  connect<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  connect<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  connect<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  connect<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  connect<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Only name
   */
  trace(name: ApiName): CreateAction<Ctx>;
  trace<P>(
    name: ApiName,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  trace<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  trace<P, ApiSuccess, ApiError = any>(
    name: ApiName,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and options
   */
  trace(name: ApiName, req: { supervisor?: any }): CreateAction<Ctx>;
  trace<P>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  trace<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<Gtx, P>;
  trace<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  trace<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name and middleware
   */
  trace(name: ApiName, fn: MiddlewareApiCo<Ctx>): CreateAction<Ctx>;
  trace<Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  trace<P>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  trace<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  trace<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  trace<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;

  /**
   * Name, options, and middleware
   */
  trace(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Ctx>,
  ): CreateAction<Ctx>;
  trace<Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateAction<Gtx>;
  trace<P>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "payload"> & Payload<P>>,
  ): CreateActionWithPayload<Omit<Ctx, "payload"> & Payload<P>, P>;
  trace<P, Gtx extends Ctx = Ctx>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Gtx>,
  ): CreateActionWithPayload<Gtx, P>;
  trace<P extends never, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>,
  ): CreateAction<Omit<Ctx, "json"> & FetchJson<ApiSuccess, ApiError>>;
  trace<P, ApiSuccess, ApiError = any>(
    name: ApiName,
    req: { supervisor?: any },
    fn: MiddlewareApiCo<
      & Omit<Ctx, "payload" | "json">
      & Payload<P>
      & FetchJson<ApiSuccess, ApiError>
    >,
  ): CreateActionWithPayload<
    & Omit<Ctx, "payload" | "json">
    & Payload<P>
    & FetchJson<ApiSuccess, ApiError>,
    P
  >;
}
