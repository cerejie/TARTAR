import { Camera, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppButton from "../../common/button/AppButton";
import FileButton from "../../common/button/FileButton";
import { useAccountAvatarHook } from "../../../hook/account/account.avatar.hook";
import {
  profileAvatar,
  profileAvatarActions,
  profileAvatarFallback,
  profileAvatarRow,
} from "../../../styles/account/account.styles";
import { formatInitials } from "../../../utils/format.utils";

const ProfileAvatar = () => {
  const {
    canEditAvatar,
    name,
    avatarUrl,
    avatarAcceptedTypes,
    chooseAvatar,
    removeAvatar,
    uploading,
    removing,
  } = useAccountAvatarHook();

  if (!canEditAvatar) return null;

  return (
    <div className={profileAvatarRow}>
      <Avatar size="lg" className={profileAvatar}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback className={profileAvatarFallback}>{formatInitials(name)}</AvatarFallback>
      </Avatar>
      <div className={profileAvatarActions}>
        <FileButton
          variant="outline"
          size="sm"
          acceptedFileTypes={avatarAcceptedTypes}
          onSelect={chooseAvatar}
          loading={uploading}
          disabled={removing}
        >
          <Camera />
          {avatarUrl ? "Change photo" : "Upload photo"}
        </FileButton>
        {avatarUrl ? (
          <AppButton
            variant="ghost"
            size="sm"
            onPress={removeAvatar}
            loading={removing}
            disabled={uploading}
          >
            <Trash2 />
            Remove
          </AppButton>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileAvatar;
