import * as React from 'react';

export const Icons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2c-3.14 0-6 1.08-8.2 3.03" />
      <path d="M12 22c3.14 0 6-1.08 8.2-3.03" />
      <path d="M2 12c0 3.14 1.08 6 3.03 8.2" />
      <path d="M22 12c0-3.14-1.08-6-3.03-8.2" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  github: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  ),
  google: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M12.24 10.28c-1.48-.04-4.88-.04-6.36 0C4.12 10.32 3 11.4 3 12.9v0c0 1.5 1.12 2.58 2.88 2.62 1.48.04 4.88.04 6.36 0 1.76-.04 2.88-1.12 2.88-2.62v0c0-1.5-1.12-2.58-2.88-2.62z"></path><path d="M21 12.9v0c0 1.5-1.12 2.58-2.88 2.62-1.48.04-4.88.04-6.36 0-1.76-.04-2.88-1.12-2.88-2.62v0c0-1.5 1.12-2.58 2.88-2.62 1.48-.04 4.88-.04 6.36 0C19.88 10.32 21 11.4 21 12.9z"></path><path d="M12.24 3.33c-1.48-.04-4.88-.04-6.36 0C4.12 3.37 3 4.45 3 6v0c0 1.5 1.12 2.58 2.88 2.62 1.48.04 4.88.04 6.36 0 1.76-.04 2.88-1.12 2.88-2.62V6c0-1.5-1.12-2.58-2.88-2.67z"></path><path d="M21 6v0c0 1.5-1.12 2.58-2.88 2.62-1.48.04-4.88.04-6.36 0-1.76-.04-2.88-1.12-2.88-2.62V6c0-1.5 1.12-2.58 2.88-2.62 1.48-.04 4.88-.04 6.36 0C19.88 3.37 21 4.45 21 6z"></path><path d="M12.24 17.24c-1.48-.04-4.88-.04-6.36 0C4.12 17.28 3 18.36 3 19.86v0c0 1.5 1.12 2.58 2.88 2.62 1.48.04 4.88.04 6.36 0 1.76-.04 2.88-1.12 2.88-2.62v0c0-1.5-1.12-2.58-2.88-2.62z"></path>
    </svg>
  ),
};
