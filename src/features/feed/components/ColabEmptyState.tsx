import { IllustrationEmptyFeed } from "@/shared/illustrations/CivicScenes";

type Props = {
  title: string;
  hint: string;
};

export function ColabEmptyState({ title, hint }: Props) {
  return (
    <div className="border-2 border-black bg-white px-4 py-6 shadow-[3px_4px_0_0_#0d0d0d]">
      <IllustrationEmptyFeed
        className="mx-auto h-36 w-full"
        title={title}
      />
      <p className="mt-4 text-[24px] leading-[1.031] font-extrabold tracking-[-1.2px] text-black">
        {title}
      </p>
      <p className="mt-2 text-[16px] leading-[1.031] tracking-[-0.8px] text-[#3d3a36]">
        {hint}
      </p>
    </div>
  );
}
