export class Message {
  content: string;
  from: string;
  constructor(from: string, content: string) {
    this.from = from;
    this.content = content;
  }
}
