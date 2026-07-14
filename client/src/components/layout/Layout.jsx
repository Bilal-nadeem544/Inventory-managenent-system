import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-[#F1E9DC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
