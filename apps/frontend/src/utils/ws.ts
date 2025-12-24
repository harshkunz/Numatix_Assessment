export const connectWS = (token: string) => {
  new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);
}
