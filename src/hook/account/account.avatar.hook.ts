import { userAvatarsKey } from "../../keys/query.keys";
import type { IUserAvatar } from "../../models/data/account/account.response";
import accountServices from "../../services/data/account.services";
import userServices from "../../services/data/user.services";
import { useAccountStore } from "../../store/data/account/account.store";
import { avatarAcceptedTypes, toAvatarImage } from "../../utils/image.utils";
import { useConfirm } from "../common/confirmation.hook";
import { useMutation } from "../common/mutation.hook";
import { useQuery } from "../common/query.hook";

export const useAvatarUrls = () => {
  const isSignedIn = useAccountStore((state) => state.kind !== null);
  const query = useQuery<IUserAvatar[]>(userAvatarsKey, () => userServices.getAvatars(), {
    enabled: isSignedIn,
    ignoreOfflineStatus: true,
  });

  const urlById = new Map(
    (query.data ?? []).map((avatar) => [avatar.id, userServices.avatarUrlOf(avatar)])
  );

  return (userId: string | undefined) => (userId ? urlById.get(userId) : undefined);
};

export const useAccountAvatarHook = () => {
  const user = useAccountStore((state) => state.user);
  const avatarUrlOf = useAvatarUrls();
  const openConfirm = useConfirm();

  const uploadMutation = useMutation(
    async (userId: string, file: File) =>
      accountServices.setOwnAvatar(userId, await toAvatarImage(file)),
    { invalidate: [userAvatarsKey], successMessage: "Profile picture updated." }
  );

  const removeMutation = useMutation(
    (userId: string) => accountServices.removeOwnAvatar(userId),
    { invalidate: [userAvatarsKey], successMessage: "Profile picture removed." }
  );

  const avatarUrl = avatarUrlOf(user?.id);

  const chooseAvatar = (files: FileList | null) => {
    const file = files?.[0];
    if (!user || !file) return;
    void uploadMutation.mutate(user.id, file);
  };

  const removeAvatar = () => {
    if (!user) return;
    openConfirm({
      kind: "delete",
      title: "Remove your profile picture?",
      okText: "Remove",
      onConfirm: () => removeMutation.mutate(user.id),
    });
  };

  return {
    canEditAvatar: user !== null,
    name: user ? user.full_name || user.username : "",
    avatarUrl,
    avatarAcceptedTypes,
    chooseAvatar,
    removeAvatar,
    uploading: uploadMutation.loading,
    removing: removeMutation.loading,
  };
};
