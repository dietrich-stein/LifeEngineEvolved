export function isWorldEnvironment(env: AnyEnvironmentType): env is WorldEnvironment {
  return (env as WorldEnvironment).organisms !== undefined;
}

export function isEditorEnvironment(env: AnyEnvironmentType): env is EditorEnvironment {
  return (env as EditorEnvironment).organism !== undefined;
}