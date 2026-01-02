"use client";

import AsyncContainer from "@/components/layout/AsyncContainer";
import Main from "@/components/layout/Main";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/context/CurrentUserProvider";
import { useLayout } from "@/context/LayoutProvider";
import { useLoggedEffect } from "@/hooks/useLoggedEffect";
import { Logger } from '@peeps/utils';
import { UserCog } from "lucide-react";
import * as React from "react";

const logger = Logger.instance('ProfilePage')

type ProfilePageProps = {
  searchParams: Promise<{
    linked?: string;
  }>;
};

const ProfilePage = (props: ProfilePageProps) => {
  const searchParams = React.use(props.searchParams);
  const linked = searchParams.linked === "1";
  const { user, userLoading, userError, updateProfile } = useCurrentUser();
  const {navigate} = useLayout();

  // Form state - initialize with empty strings, will be populated when user data is available
  const [preferredName, setPreferredName] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [middleNames, setMiddleNames] = React.useState<string[]>([]);
  const [lastName, setLastName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const name = [firstName, ...middleNames]
      .map((s) => s.trim())
      .filter(Boolean);
    const family = lastName.trim();

    updateProfile.mutate({
      name,
      dateOfBirth,
      preferredName: preferredName.trim() || undefined,
      familyNames: family
        ? [{ name: family, category: "other", active: true, order: 0 }]
        : [],
    }, {
      onSuccess: () => {
        setStatus("Profile updated successfully!");
        setIsEditing(false);
      },
      onError: (error) => {
        setStatus(error.message);
      }
    });
  }

  function cancelEdit() {
    // Reset form to current user data
    if (user) {
      setPreferredName(user.preferredName || "");
      setFirstName(user.name[0] || "");
      setMiddleNames(user.name.slice(1) || []);
      setDateOfBirth(user.dateOfBirth || "");
    }
    setIsEditing(false);
    setStatus(null);
  }

  // Initialize form with user data when it becomes available
  useLoggedEffect({
    logger,
    effect: () => {
      if (user) {
        setPreferredName(user.preferredName || "");
        setFirstName(user.name[0] || "");
        setMiddleNames(user.name.slice(1) || []);
        setDateOfBirth(user.dateOfBirth || "");
      }
    },
    deps: [user]
  });

  return (
    <AsyncContainer isLoading={[userLoading]} error={[userError]}>
      {user && (
        <Main title="User Profile">
          {linked ? (
            <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-900">
              Login provider linked.
            </div>
          ) : null}

          {/* Family Onboarding Notice */}
          <div className="mb-4 rounded bg-blue-50 p-3 text-sm text-blue-900">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/onboarding')}
              >
                <UserCog />
              </Button>
              <span>
                Connect with your family.
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Profile Display */}
            {!isEditing && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Preferred Name
                    </label>
                    <p className="mt-1">
                      {user.preferredName || "Not set"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <p className="mt-1">{user.fullName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <p className="mt-1">
                      {new Date(user.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="mt-1">{user.auth.email}</p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            )}

            {/* Edit Form */}
            {isEditing && (
              <form className="space-y-4" onSubmit={onSubmit}>
                <h2 className="text-xl font-semibold">Edit Profile</h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        Preferred name
                      </span>
                      <input
                        className="rounded border border-input bg-background px-3 py-2"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        placeholder="What should we call you?"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm font-medium">First name</span>
                      <input
                        className="rounded border border-input bg-background px-3 py-2"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Middle names
                        </span>
                        <button
                          className="rounded border border-input px-2 py-1 text-sm"
                          type="button"
                          onClick={() =>
                            setMiddleNames((prev) => [...prev, ""])
                          }
                        >
                          Add middle name
                        </button>
                      </div>

                      {middleNames.map((value, idx) => (
                        <div className="flex gap-2" key={idx}>
                          <input
                            className="flex-1 rounded border border-input bg-background px-3 py-2"
                            value={value}
                            onChange={(e) => {
                              const next = [...middleNames];
                              next[idx] = e.target.value;
                              setMiddleNames(next);
                            }}
                          />
                          <button
                            className="rounded border border-input px-2"
                            type="button"
                            onClick={() =>
                              setMiddleNames((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Date of birth</span>
                      <input
                        className="rounded border border-input bg-background px-3 py-2"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Last name</span>
                      <input
                        className="rounded border border-input bg-background px-3 py-2"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
                    type="submit"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    className="rounded border border-input px-4 py-2"
                    type="button"
                    onClick={cancelEdit}
                    disabled={updateProfile.isPending}
                  >
                    Cancel
                  </button>
                </div>

                {status ? (
                  <pre
                    className={`whitespace-pre-wrap rounded p-3 text-sm ${
                      status.includes("success")
                        ? "bg-green-50 text-green-900"
                        : "bg-red-50 text-red-900"
                    }`}
                  >
                    {status}
                  </pre>
                ) : null}
              </form>
            )}
          </div>
        </Main>
      )}
    </AsyncContainer>
  );
};

ProfilePage.displayName = "ProfilePage";
export default ProfilePage;
