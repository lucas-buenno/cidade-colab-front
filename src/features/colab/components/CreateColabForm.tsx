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
import { useSupportStore } from "@/features/feed/supportStore";
import { Button } from "@/shared/components/Button";
import { FormErrorSummary } from "@/shared/components/FormErrorSummary";
import { LocationPicker } from "@/shared/components/LocationPicker";
import { Modal } from "@/shared/components/Modal";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { TextAreaField } from "@/shared/components/TextAreaField";
import type { AppError } from "@/shared/api/errors";
import { messages } from "@/shared/i18n/pt-BR";
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

export function CreateColabForm() {
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
    if (empty) return;
    persistDraft(
      { title, description, categoriesSlugs, location },
      prepared,
    );
  }, [title, description, categoriesSlugs, location, prepared]);

  const fieldErrors = useMemo(() => {
    const items: Array<{ href: string; label: string }> = [];
    if (errors.categoriesSlugs?.message) {
      items.push({
        href: "#categories",
        label: errors.categoriesSlugs.message,
      });
    }
    if (errors.title?.message) {
      items.push({ href: "#title", label: errors.title.message });
    }
    if (imageError) {
      items.push({ href: "#colab-image", label: imageError });
    }
    if (errors.description?.message) {
      items.push({
        href: "#description",
        label: errors.description.message,
      });
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
          useSupportStore.getState().add(prepared.colabId);
          clearCreateDraft();
          navigate(`/colab/${prepared.colabId}`, { replace: true });
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

  return (
    <>
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        data-testid="create-colab-form"
      >
        {!canCreate ? (
          <div className="mt-4">
            <RequestErrorBanner
              error={{
                kind: "forbidden",
                message: messages.create.noPermissionBanner,
                retryable: false,
              }}
              testId="create-colab-forbidden-banner"
            />
          </div>
        ) : null}

        {requestError ? (
          <div className="mt-4">
            <RequestErrorBanner
              error={requestError}
              testId="create-colab-error"
              onRetry={
                requestError.retryable
                  ? () => void handleSubmit(onSubmit, onInvalid)()
                  : undefined
              }
            />
          </div>
        ) : null}

        {submitCount > 0 ? (
          <div className="mt-4">
            <FormErrorSummary
              title={messages.errors.summaryTitle}
              items={fieldErrors}
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="title" className="text-sm font-bold text-foreground">
            {messages.create.fieldTitle}
            <span className="text-destructive"> *</span>
          </label>
          <input
            id="title"
            aria-required="true"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            placeholder={messages.create.titlePlaceholder}
            className={`mt-1 w-full border-0 border-b bg-transparent px-0 py-2 text-2xl font-bold text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground ${
              errors.title ? "border-destructive" : "border-border"
            }`}
            {...register("title")}
          />
          <p
            id="title-error"
            role={errors.title ? "alert" : undefined}
            className="min-h-5 text-sm text-destructive"
          >
            {errors.title?.message ?? ""}
          </p>
        </div>

        <div className="mt-3">
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
        </div>

        <div className="mt-6">
          <ImageUploadField
            value={prepared}
            onChange={setPrepared}
            error={imageError}
            onErrorChange={setImageError}
            onBusyChange={setImageBusy}
          />
        </div>

        <div className="mt-4">
          <TextAreaField
            id="description"
            label={
              <>
                {messages.create.descriptionLabel}
                <span className="text-destructive"> *</span>
              </>
            }
            placeholder={messages.create.descriptionPlaceholder}
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        <div className="mt-2 pb-28">
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

        <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-end gap-3 pb-[env(safe-area-inset-bottom)]">
            <Button
              type="submit"
              fullWidth={false}
              disabled={!canSubmit}
              loading={createMutation.isPending}
              loadingLabel={messages.create.publishing}
              className="min-w-28"
              data-testid="create-colab-submit"
              title={
                canSubmit
                  ? undefined
                  : "Preencha título, descrição, categoria, foto e localização"
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
