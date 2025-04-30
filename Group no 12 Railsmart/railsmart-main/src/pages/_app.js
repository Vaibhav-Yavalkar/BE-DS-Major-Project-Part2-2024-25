import "@/styles/globals.css";
import { useState } from "react";
import PaymentCheck from "@/pages/components/PaymentCheck";

export default function App({ Component, pageProps }) {
  const [accessGranted, setAccessGranted] = useState(false);

  return (
    <>
      {!accessGranted ? (
        <PaymentCheck onAccessGranted={() => setAccessGranted(true)} />
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}