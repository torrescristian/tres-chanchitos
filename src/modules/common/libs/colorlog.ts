export default function colorlog(str: string, color: string) {
  console.log(`%c${str}`, `color: ${color}`);
}
