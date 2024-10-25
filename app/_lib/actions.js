"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBooking, getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();

  if (!session) throw new Error(`You must be logged in!`);

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error(`National ID must be between 6 and 12 chars`);

  const updateData = { nationality, countryFlag, nationalID };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error(`You must be logged in!`);

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => {
    return booking.id;
  });

  if (!guestBookingsIds.includes(bookingId))
    throw new Error(`Ne mozes obrisat kraljuu!!!`);

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  //Authentication
  const session = await auth();
  if (!session) throw new Error(`You must be logged in!`);

  const bookingId = formData.get("bookingId");

  //Authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => {
    return String(booking.id);
  });

  if (!guestBookingsIds.includes(bookingId))
    throw new Error(`Ne mozes EDITAT kraljuu!!!`);

  //update form
  const numGuests = formData.get("numGuests");
  const observations = formData.get("observations");
  const updateData = { numGuests, observations };

  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  //Error handling
  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }

  //revalidation
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  //redirecting
  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
