export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-sm p-6 border border-[#E6D9C3] shadow-xl">
        <h2 className="text-base font-semibold text-[#3B2F26] mb-2">{title}</h2>
        <p className="text-sm text-[#8A7C68] mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#8A7C68] hover:bg-[#F1E9DC]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}