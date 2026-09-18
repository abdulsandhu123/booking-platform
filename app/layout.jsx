import "./globals.css";
import { AuthProvider } from "../components/AuthContext.jsx";
import Nav from "../components/Nav.jsx";

export const metadata = {
  title: "StayFinder — Property Booking Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app">
            <Nav />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
