import React from "react";
import { Provider } from "../react.js";
import { createSchema, createStore, slice } from "../store/index.js";
import { expect, test } from "../test.js";

// typing test
test("react types", () => {
  const [schema, initialState] = createSchema({
    cache: slice.table(),
    loaders: slice.loaders(),
  });
  const store = createStore({ initialState });
  React.createElement(Provider, {
    schema,
    store,
    children: React.createElement("div"),
  });
  expect(true).toBe(true);
});
