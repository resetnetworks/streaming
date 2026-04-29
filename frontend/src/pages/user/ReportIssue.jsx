import { useState } from "react";
import * as Sentry from "@sentry/react";
import IconHeader from "../../components/user/IconHeader";
import BackgroundWrapper from "../../components/BackgroundWrapper";
import PageSEO from "../../components/PageSeo/PageSEO";
import { toast } from "sonner";
import Footer from "../../components/user/Footer";

export default function ReportIssue() {
  const [form, setForm] = useState({
    title: "",
    desc: "",
    category: "bug",
    pageUrl: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Only image files allowed");
    if (file.size > 5 * 1024 * 1024) return alert("File too large (max 5MB)");
    setForm((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.desc.trim())
      return alert("Please fill all required fields");

    setLoading(true);

    try {
      const finalPageUrl = form.pageUrl.trim() ? form.pageUrl : window.location.href;
      let imageUrl = "";

      if (form.file) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) throw new Error("Cloudinary configuration missing");

        const data = new FormData();
        data.append("file", form.file);
        data.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: data }
        );
        const result = await res.json();
        if (!result.secure_url) throw new Error("Image upload failed");
        imageUrl = result.secure_url;
      }

      Sentry.captureMessage("User Bug Report", {
        level: "error",
        tags: { category: form.category },
        extra: {
          title: form.title,
          description: form.desc,
          page: finalPageUrl,
          screenshot: imageUrl || "No screenshot",
        },
      });

      const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
      if (!endpoint) throw new Error("Formspree endpoint missing");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.desc);
      formData.append("category", form.category);
      formData.append("page", finalPageUrl);
      if (imageUrl) formData.append("screenshot_url", imageUrl);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Form submission failed");
      }

      toast.success("Issue submitted successfully!");
      setForm({ title: "", desc: "", category: "bug", pageUrl: "", file: null });
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      id: "title",
      label: "title *",
      type: "input",
      placeholder: "Brief summary of the issue",
      required: true,
    },
    {
      id: "desc",
      label: "description *",
      type: "textarea",
      placeholder: "Please provide details about the issue...",
      required: true,
    },
  ];

  return (
    <>
      <PageSEO
        title="Report an Issue - Reset Music"
        description="Found a bug or have a suggestion? Let us know and help improve Reset Music."
        canonicalUrl="https://musicreset.com/report-issue"
        noIndex={true}
      />
      <BackgroundWrapper>
        <section className="w-full min-h-screen flex flex-col items-center">
          <IconHeader />

          <div className="text-white sm:mt-auto mt-10 mb-auto flex flex-col items-center w-full">
            <h1 className="text-4xl font-normal mb-8 tracking-tight">
              <span className="text-blue-500">report</span> an issue
            </h1>

            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[620px] mx-auto px-4"
            >
              <div className="rounded-xl border-b-[3px] border-blue-800 bg-gradient-to-br from-[#0a0a23] to-[#0d1b3f] py-8 px-8 flex flex-col gap-5"
                   style={{ border: "0.5px solid rgba(59,130,246,0.25)", borderBottom: "3px solid #1d4ed8" }}>

                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="title" className="text-slate-200 text-sm">title *</label>
                  <input
                    id="title" name="title" type="text"
                    placeholder="Brief summary of the issue"
                    className="bg-white/5 border border-white/10 rounded-lg text-slate-200 text-sm px-3 py-2.5 placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                    value={form.title} onChange={handleChange}
                    disabled={loading} required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="desc" className="text-slate-200 text-sm">description *</label>
                  <textarea
                    id="desc" name="desc" rows={4}
                    placeholder="Please provide details about the issue..."
                    className="bg-white/5 border border-white/10 rounded-lg text-slate-200 text-sm px-3 py-2.5 placeholder-gray-600 outline-none focus:border-blue-500 transition-colors resize-none"
                    value={form.desc} onChange={handleChange}
                    disabled={loading} required
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="category" className="text-slate-200 text-sm">category</label>
                  <select
                    id="category" name="category"
                    className="bg-white/5 border border-white/10 rounded-lg text-slate-200 text-sm px-3 py-2.5 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                    value={form.category} onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="bug">Bug</option>
                    <option value="payment">Payment Issue</option>
                    <option value="ui">UI / UX Issue</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>

                {/* Screenshot */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="file" className="text-slate-200 text-sm">screenshot (optional)</label>
                  <input
                    id="file" type="file" accept="image/*"
                    className="bg-white/5 border border-white/10 rounded-lg text-slate-200 text-sm px-3 py-2 outline-none focus:border-blue-500 transition-colors cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                    onChange={handleFileChange} disabled={loading}
                  />
                </div>

                {/* Page URL */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="pageUrl" className="text-slate-200 text-sm">page url (optional)</label>
                  <input
                    id="pageUrl" name="pageUrl" type="url"
                    placeholder="https://musicreset.com/..."
                    className="bg-white/5 border border-white/10 rounded-lg text-slate-200 text-sm px-3 py-2.5 placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                    value={form.pageUrl} onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-center mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="border border-blue-600 text-blue-400 hover:bg-blue-700 hover:text-white rounded-lg px-8 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Your feedback helps us improve musicreset.
                </p>
              </div>
            </form>
          </div>
        </section>
      <Footer />
      </BackgroundWrapper>
    </>
  );
}