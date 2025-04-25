import React, { useState } from 'react';
import { supabase } from '../../supabase';

// Festival Submission Component
const FestivalSubmission = () => {
  const [festivalName, setFestivalName] = useState('');
  const [description, setDescription] = useState('');
  const [celebratedRegions, setCelebratedRegions] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!festivalName || !description || !state ) {
      setErrorMessage('Please fill all required fields');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);

    if (!user) {
      setErrorMessage("You must be logged in to submit a festival.");
      return;
    }

    const { data, error } = await supabase
    .from('user_submissions')
    .insert([{
        festival_name: festivalName,
        description,
        celebrated_regions: celebratedRegions,
        state,
        district,
        taluka,
        submitted_by: user.id, // Use the actual user ID here
        status: 'Pending',
    }]);


    if (error) {
      console.error('Error submitting festival data:', error);
      setErrorMessage('Something went wrong, please try again later.');
    } else {
      alert('Your submission is pending approval.');
      setFestivalName('');
      setDescription('');
      setCelebratedRegions('');
      setState('');
      setDistrict('');
      setTaluka('');
      setErrorMessage('');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Submit Festival Data</h3>

      <input
        type="text"
        value={festivalName}
        onChange={(e) => setFestivalName(e.target.value)}
        placeholder="Festival Name *"
        className="block w-full p-2 mb-3 border rounded"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Festival Description *"
        rows={4}
        className="block w-full p-2 mb-3 border rounded"
      />

      <input
        type="text"
        value={celebratedRegions}
        onChange={(e) => setCelebratedRegions(e.target.value)}
        placeholder="Celebrated in (regions, optional)"
        className="block w-full p-2 mb-3 border rounded"
      />

      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
        placeholder="State *"
        className="block w-full p-2 mb-3 border rounded"
      />

      <input
        type="text"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        placeholder="District"
        className="block w-full p-2 mb-3 border rounded"
      />

      <input
        type="text"
        value={taluka}
        onChange={(e) => setTaluka(e.target.value)}
        placeholder="Taluka"
        className="block w-full p-2 mb-3 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>

      {errorMessage && <div className="text-red-600 mt-2">{errorMessage}</div>}
    </div>
  );
};

// Festival Submission Wrapper (for toggle behavior)
const FestivalSubmissionWrapper = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="my-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
      >
        {showForm ? 'Hide Festival Form' : 'Submit a Festival'}
      </button>

      {showForm && (
        <div className="mt-4 p-4 border rounded bg-white shadow">
          <FestivalSubmission />
        </div>
      )}
    </div>
  );
};

export default FestivalSubmissionWrapper; // Default export the wrapper component
export { FestivalSubmission }; // Named export for FestivalSubmission
