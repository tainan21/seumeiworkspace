export default {
  header: {
    changelog: "Changelog",
    about: "About",
    login: "Login",
    dashboard: "Dashboard",
  },
  hero: {
    top: "Introducing",
    main: "Quick Starter Template for your Next project",
    sub: "Packed with all necessary features to get started.",
    firstButton: "Get started",
    tools: "Built using Great Tools",
    on: "on",
  },
  features: {
    top: "Features",
    details:
      "This template comes with features like Authentication, API routes, File uploading and more in Next.js App dir.",
    libs: {
      nextjs:
        "App dir, Routing, Layouts, API routes, Server Components, Server actions.",
      tailwindcss:
        "UI components built using Radix UI and styled with Tailwind CSS.",
      postgres: "Using Postgres with Prisma ORM, hosted on Vercel Postgres.",
      lucia: "Authentication and Authorization using LuciaAuth v3.",
      uploadthing: "Upload and preview files effortlessly with UploadThing.",
      reactEmail: "Create emails using React Email and Send with Resend.",
      internationalization:
        "Internationalization support with type-safe Next-International.",
      stripe: "Receive and process payments with Stripe.",
      vercel: "Production and Preview deployments with Vercel.",
    },
    aboutMd: "Seumei also includes Changelog & About page built using",
  },
  notFound: {
    title: "Page Not Found!",
  },
  settings: {
    title: "Settings",
    picture: {
      label: "Picture",
      description: "Click on the avatar to upload a new one.",
    },
    name: {
      label: "Name",
      placeholder: "Your name",
    },
    email: {
      label: "Email",
      placeholder: "Your email address",
    },
    buttons: {
      reset: "Reset",
      update: "Update",
      updating: "Updating...",
    },
    messages: {
      updated: "Updated successfully!",
      error: "Something went wrong.",
    },
    resetModal: {
      title: "Are you sure you want to discard the changes?",
      confirm: "Yes",
      cancel: "No",
    },
    imageUpload: {
      title: "Image Upload",
      dropOrClick: "Drop or Click Here",
      cancel: "Cancel",
      upload: "Upload",
      uploading: "Uploading...",
      success: "Uploaded successfully!",
      error: "Error occurred while uploading!",
      fileInfo: "Only Image files are supported and size limit up to",
    },
  },
} as const;
