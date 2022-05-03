export class User {
  username: string;
  constructor(username: string) {
    this.username = username;
    console.log(`created user ${username}!`);
  }
}
