export function passwordValidator(
  value: string,
  callback: (error?: string) => void
) {
  if (value.length < 12) {
    callback("密码长度不能小于12位");
  } else {
    callback();
  }
}
