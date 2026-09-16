import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CategoryMultiSelect } from "@/features/colab/components/CategoryMultiSelect";
import { ImageUploadField } from "@/features/colab/components/ImageUploadField";
import {
  clearCreateDraft,
  readCreateDraft,
  writeCreateDraft,
} from "@/features/colab/draftStorage";
import { useCreateColab } from "@/features/colab/hooks/useCreateColab";
import {
  createColabSchema,
  type CreateColabFormValues,
} from "@/features/colab/schemas";
import { useSessionStore } from "@/features/auth/sessionStore";
import { Button } from "@/shared/components/Button";
import { FormErrorSummary } from "@/shared/components/FormErrorSummary";
import { LocationPicker } from "@/shared/components/LocationPicker";
import { Modal } from "@/shared/components/Modal";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { TextAreaField } from "@/shared/components/TextAreaField";
import { TextField } from "@/shared/components/TextField";
import type { AppError } from "@/shared/api/errors";
import { messages } from "@/shared/i18n/pt-BR";
import { IllustrationSuccess } from "@/shared/illustrations/CivicScenes";
import arrowRightAltUrl from "@/assets/icons/arrow-right-alt.svg";
import type { PrepareColabResponse } from "@/shared/types/colab";
import { formatLocationName } from "@/shared/utils/location";
import { hasColabCreatePermission } from "@/shared/utils/permissions";

function persistDraft(
  values: CreateColabFormValues,
  prepare: PrepareColabResponse | null,
) {
  writeCreateDraft({
    ...values,
    prepare,
    savedAt: new Date().toISOString(),
  });
}

type Props = {
  onPublished?: () => void;
};

export function CreateColabForm({ onPublished }: Props) {
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const canCreate = hasColabCreatePermission(user);
  const createMutation = useCreateColab();
  const draft = useMemo(() => readCreateDraft(), []);

  const [prepared, setPrepared] = useState<PrepareColabResponse | null>(
    () => draft?.prepare ?? null,
  );
  const [imageError, setImageError] = useState<string | undefined>();
  const [imageBusy, setImageBusy] = useState(false);
  const [requestError, setRequestError] = useState<AppError | null>(null);
  const [forbiddenOpen, setForbiddenOpen] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const form = useForm<CreateColabFormValues>({
    resolver: zodResolver(createColabSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      title: draft?.title ?? "",
      description: draft?.description ?? "",
      categoriesSlugs: draft?.categoriesSlugs ?? [],
      location: draft?.location ?? {
        name: "",
        reference: "",
        street: "",
        number: "",
        neighborhood: "",
        postalCode: "",
        coordinates: null,
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  const title = watch("title");
  const description = watch("description");
  const categoriesSlugs = watch("categoriesSlugs");
  const location = watch("location");

  useEffect(() => {
    const empty =
      !title.trim() &&
      !description.trim() &&
      categoriesSlugs.length === 0 &&
      !prepared &&
      !location.street.trim() &&
      !location.neighborhood.trim();
    if (empty) {
      clearCreateDraft();
      return;
    }
    persistDraft(
      { title, description, categoriesSlugs, location },
      prepared,
    );
  }, [title, description, categoriesSlugs, location, prepared]);

  const fieldErrors = useMemo(() => {
    const items: Array<{ href: string; label: string }> = [];
    if (errors.title?.message) {
      items.push({ href: "#title", label: errors.title.message });
    }
    if (errors.categoriesSlugs?.message) {
      items.push({
        href: "#categories",
        label: errors.categoriesSlugs.message,
      });
    }
    if (errors.description?.message) {
      items.push({
        href: "#description",
        label: errors.description.message,
      });
    }
    if (imageError) {
      items.push({ href: "#colab-image", label: imageError });
    }
    if (errors.location?.street?.message) {
      items.push({
        href: "#location-street",
        label: errors.location.street.message,
      });
    }
    if (errors.location?.neighborhood?.message) {
      items.push({
        href: "#location-neighborhood",
        label: errors.location.neighborhood.message,
      });
    }
    if (errors.location?.coordinates?.message) {
      items.push({
        href: "#location-street",
        label: errors.location.coordinates.message,
      });
    }
    return items;
  }, [errors, imageError]);

  useEffect(() => {
    if (submitCount === 0 || fieldErrors.length === 0) return;
    document.getElementById("form-error-summary")?.focus();
  }, [submitCount, fieldErrors]);

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(description.trim()) &&
    categoriesSlugs.length > 0 &&
    Boolean(location.street.trim()) &&
    Boolean(location.neighborhood.trim()) &&
    Boolean(location.coordinates) &&
    Boolean(prepared?.imageKey && prepared?.colabId) &&
    !imageBusy &&
    canCreate &&
    !createMutation.isPending &&
    !isSubmitting;

  const applyServerFields = (error: AppError) => {
    if (!error.fields) return;
    for (const [path, message] of Object.entries(error.fields)) {
      if (
        path === "title" ||
        path === "description" ||
        path === "categoriesSlugs"
      ) {
        setError(path, { type: "server", message });
      }
      if (path.startsWith("location.")) {
        setError(path as "location.street", { type: "server", message });
      }
      if (path === "imageKey" || path === "colabId") {
        setImageError(message);
      }
    }
  };

  const onInvalid = () => {
    if (!prepared) {
      setImageError(messages.create.imageRequired);
    }
  };

  const onSubmit = (values: CreateColabFormValues) => {
    if (!prepared?.imageKey || !prepared.colabId) {
      setImageError(messages.create.imageRequired);
      document.getElementById("colab-image")?.focus();
      return;
    }
    if (!values.location.coordinates) {
      setError("location.coordinates", {
        type: "manual",
        message: messages.create.coordinatesRequired,
      });
      return;
    }
    if (!canCreate) {
      setForbiddenOpen(true);
      return;
    }

    setRequestError(null);

    createMutation.mutate(
      {
        colabId: prepared.colabId,
        title: values.title.trim(),
        description: values.description.trim(),
        categoriesSlugs: values.categoriesSlugs,
        imageKey: prepared.imageKey,
        location: {
          name:
            values.location.name.trim() ||
            formatLocationName(values.location),
          reference: values.location.reference.trim(),
          street: values.location.street.trim(),
          number: values.location.number.trim(),
          neighborhood: values.location.neighborhood.trim(),
          postalCode: values.location.postalCode.trim(),
          coordinates: values.location.coordinates,
        },
      },
      {
        onSuccess: () => {
          clearCreateDraft();
          setPublishedId(prepared.colabId);
          onPublished?.();
        },
        onError: (error) => {
          if (error.kind === "forbidden") {
            setForbiddenOpen(true);
            return;
          }
          applyServerFields(error);
          setRequestError(error);
          window.requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>("[data-testid='create-colab-error']")
              ?.focus();
          });
        },
      },
    );
  };

  if (publishedId) {
    return (
      <div className="flex flex-col items-center text-center">
        <IllustrationSuccess
          className="h-44 w-full"
          title={messages.create.successTitle}
        />
        <h1 className="mt-4 text-[32px] leading-[1.031] font-extrabold tracking-[-1.6px] text-black lg:text-[40px]">
          {messages.create.successTitle}
        </h1>
        <p className="mt-2 max-w-prose text-base leading-[1.031] tracking-[-0.8px] text-black">
          {messages.create.successBody}
        </p>
        <Button
          type="button"
          className="mt-6"
          onClick={() => navigate(`/colab/${publishedId}`, { replace: true })}
        >
          {messages.create.seeColab}
        </Button>
      </div>
    );
  }

  return (
    <>
      <form
        className="flex flex-col gap-[25px] pt-6"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        data-testid="create-colab-form"
      >
        {!canCreate ? (
          <RequestErrorBanner
            error={{
              kind: "forbidden",
              message: messages.create.noPermissionBanner,
              retryable: false,
            }}
            testId="create-colab-forbidden-banner"
          />
        ) : null}

        {requestError ? (
          <RequestErrorBanner
            error={requestError}
            testId="create-colab-error"
            onRetry={
              requestError.retryable
                ? () => void handleSubmit(onSubmit, onInvalid)()
                : undefined
            }
          />
        ) : null}

        {submitCount > 0 ? (
          <FormErrorSummary
            title={messages.errors.summaryTitle}
            items={fieldErrors}
          />
        ) : null}

        <div className="flex flex-col gap-[25px] lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-[25px]">
            <TextField
              id="title"
              label={messages.create.fieldTitle}
              aria-required="true"
              placeholder={messages.create.titlePlaceholder}
              error={errors.title?.message}
              {...register("title")}
            />

            <TextAreaField
              id="description"
              label={messages.create.descriptionLabel}
              placeholder={messages.create.descriptionPlaceholder}
              hint={messages.create.descriptionHint}
              error={errors.description?.message}
              className="md:h-72 lg:h-80"
              {...register("description")}
            />

            <Controller
              control={control}
              name="categoriesSlugs"
              render={({ field }) => (
                <CategoryMultiSelect
                  id="categories"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoriesSlugs?.message}
                />
              )}
            />

            <ImageUploadField
              value={prepared}
              onChange={setPrepared}
              error={imageError}
              onErrorChange={setImageError}
              onBusyChange={setImageBusy}
            />
          </div>

          <div className="flex flex-col gap-[25px]">
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <LocationPicker
                  value={field.value}
                  onChange={field.onChange}
                  errors={{
                    street: errors.location?.street?.message,
                    neighborhood: errors.location?.neighborhood?.message,
                    coordinates: errors.location?.coordinates?.message,
                  }}
                />
              )}
            />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 bg-white px-4 py-6 lg:static lg:z-auto lg:bg-transparent lg:p-0">
          <div className="mx-auto w-full max-w-[402px] lg:mx-0 lg:max-w-none">
            <Button
              type="submit"
              disabled={!canSubmit}
              loading={createMutation.isPending}
              loadingLabel={messages.create.publishing}
              data-testid="create-colab-submit"
              title={canSubmit ? undefined : messages.create.submitIncomplete}
              icon={
                <img
                  src={arrowRightAltUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="block size-8 shrink-0"
                  aria-hidden="true"
                />
              }
            >
              {messages.create.publish}
            </Button>
          </div>
        </div>
      </form>

      <Modal
        open={forbiddenOpen}
        title={messages.create.forbiddenTitle}
        onClose={() => setForbiddenOpen(false)}
        footer={
          <Button type="button" onClick={() => setForbiddenOpen(false)}>
            {messages.create.forbiddenClose}
          </Button>
        }
      >
        <p>{messages.create.forbiddenBody}</p>
      </Modal>
    </>
  );
}
