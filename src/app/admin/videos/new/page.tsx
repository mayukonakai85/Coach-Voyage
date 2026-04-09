import { VideoForm } from "../VideoForm";

export default function NewVideoPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">動画を追加</h1>
        <p className="text-gray-500 mt-1">
          Bunny.net にアップロード済みの動画IDを入力してください
        </p>
      </div>
      <VideoForm />
    </div>
  );
}
