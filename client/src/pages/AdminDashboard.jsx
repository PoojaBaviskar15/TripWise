// Full AdminDashboard Component with Festival Submission Moderation

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout, deleteAccount } from "../../../api/controllers/auth.controller";
import { useAuth } from "../components/AuthContext";
import { supabase } from "../../supabase";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pendingAgencies, setPendingAgencies] = useState([]);
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const emptyForm = {
    name: "",
    description: "",
    category: "",
    latitude: "",
    longitude: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPendingAgencies();
    fetchPendingEvents();
    fetchLocations();
    fetchFestivalSubmissions();
  }, []);

  const fetchPendingAgencies = async () => {
    const { data, error } = await supabase
      .from("agencies")
      .select("id, agency_name, contact_number, website, status, user_id")
      .eq("status", "pending");
    if (!error) setPendingAgencies(data || []);
  };

  const fetchPendingEvents = async () => {
    const response = await fetch("/api/pending-events");
    const data = await response.json();
    setEvents(data);
  };

  const fetchFestivalSubmissions = async () => {
    const { data, error } = await supabase
      .from("user_submissions")
      .select("*")
      .eq("status", "Pending");
    if (!error) setSubmissions(data);
  };

  const approveAgency = async (agencyId) => {
    await supabase.from("agencies").update({ status: "approved" }).eq("id", agencyId);
    setPendingAgencies((prev) => prev.filter((agency) => agency.id !== agencyId));
  };

  const rejectAgency = async (agencyId) => {
    await supabase.from("agencies").delete().eq("id", agencyId);
    setPendingAgencies((prev) => prev.filter((agency) => agency.id !== agencyId));
  };

  const handleApproval = async (eventId, approve) => {
    await fetch(`/api/approve-event/${eventId}`, {
      method: "POST",
      body: JSON.stringify({ approved: approve }),
    });
    fetchPendingEvents();
  };

  const handleFestivalApproval = async (submissionId) => {
    const { data: submission } = await supabase
      .from("user_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    await supabase.from("festival_popularity").insert([
      {
        festival_name: submission.festival_name,
        description: submission.description,
        state: submission.state,
        district: submission.district,
        taluka: submission.taluka,
        popularity: 50,
        source: "User",
      },
    ]);

    await supabase
      .from("user_submissions")
      .update({ status: "Approved" })
      .eq("id", submissionId);

    fetchFestivalSubmissions();
  };

  const handleFestivalRejection = async (submissionId) => {
    await supabase.from("user_submissions").delete().eq("id", submissionId);
    fetchFestivalSubmissions();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your admin account? This action is irreversible!")) {
      await deleteAccount();
      navigate("/sign-up");
    }
  };

  const fetchLocations = async () => {
    const { data } = await supabase.from("locations").select("*");
    setLocations(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from("locations").update(form).eq("id", editingId);
    } else {
      await supabase.from("locations").insert([form]);
    }
    setForm(emptyForm);
    setEditingId(null);
    fetchLocations();
  };

  const handleDelete = async (id) => {
    await supabase.from("locations").delete().eq("id", id);
    fetchLocations();
  };

  const handleEdit = (loc) => {
    setForm(loc);
    setEditingId(loc.id);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-purple-100 h-full min-h-screen space-y-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Pending Agencies */}
      <section>
        <h2 className="text-2xl font-semibold">Pending Agency Approvals</h2>
        {pendingAgencies.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <ul className="space-y-4 mt-4">
            {pendingAgencies.map((agency) => (
              <li key={agency.id} className="border p-4 rounded-md shadow bg-white">
                <strong>{agency.agency_name}</strong>
                <p>Contact: {agency.contact_number}</p>
                <p>Website: {agency.website}</p>
                <p>Status: {agency.status}</p>
                <div className="mt-2 space-x-2">
                  <button onClick={() => approveAgency(agency.id)} className="bg-green-600 text-white px-4 py-2 rounded">Approve</button>
                  <button onClick={() => rejectAgency(agency.id)} className="bg-red-600 text-white px-4 py-2 rounded">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Event Approvals */}
      <section>
        <h2 className="text-2xl font-semibold">Pending Event Approvals</h2>
        <table className="min-w-full mt-4 table-auto bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Event Name</th>
              <th className="p-2 text-left">Start Date</th>
              <th className="p-2 text-left">End Date</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="p-2">{event.name}</td>
                <td className="p-2">{event.startDate}</td>
                <td className="p-2">{event.endDate}</td>
                <td className="p-2">{event.status}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => handleApproval(event.id, true)} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                  <button onClick={() => handleApproval(event.id, false)} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Festival Submissions */}
      <section>
        <h2 className="text-2xl font-semibold">🧧 Festival Submissions</h2>
        {submissions.length === 0 ? (
          <p>No festival submissions pending.</p>
        ) : (
          <ul className="space-y-4 mt-4">
            {submissions.map((item) => (
              <li key={item.id} className="border p-4 rounded-md shadow bg-white">
                <strong>{item.festival_name}</strong>
                <p>{item.description}</p>
                <p> {item.state} &gt {item.district} &gt {item.taluka}</p>
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleFestivalApproval(item.id)} className="bg-green-600 text-white px-4 py-2 rounded">Approve</button>
                  <button onClick={() => handleFestivalRejection(item.id)} className="bg-red-600 text-white px-4 py-2 rounded">Reject</button>

                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Marker Management */}
      <section>
        <h2 className="text-2xl font-semibold">🛠 Marker Management</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white p-4 rounded shadow">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="input" required />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input" required />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="input" required />
          <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" type="number" className="input" required />
          <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" type="number" className="input" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-full">
            {editingId ? "Update Marker" : "Add Marker"}
          </button>
        </form>
        <div className="space-y-4 mt-4">
          {locations.map((loc) => (
            <div key={loc.id} className="p-4 border rounded bg-gray-50">
              <div className="font-semibold">{loc.name}</div>
              <div className="text-sm">{loc.category}</div>
              <div className="text-sm">{loc.description}</div>
              <div className="text-sm">📍 {loc.latitude}, {loc.longitude}</div>
              <div className="mt-2 space-x-2">
                <button onClick={() => handleEdit(loc)} className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(loc.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Account Actions */}
      <div className="flex justify-between">
        <button onClick={handleLogout} className="bg-orange-600 text-white font-bold px-4 py-2 rounded">Sign Out</button>
        <button onClick={handleDeleteAccount} className="bg-red-700 text-white font-bold px-4 py-2 rounded">Delete Account</button>
      </div>
    </div>
  );
}
