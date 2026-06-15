// app/(tabs)/aibot/index.tsx
import { Redirect } from 'expo-router';
import React from 'react';

export default function AIBotRedirect() {
  return <Redirect href="/chat" />;
}