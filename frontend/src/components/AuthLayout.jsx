
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-md">

        <div className="border border-gray-200 rounded-lg p-6 sm:p-8">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-roboto-condensed font-medium">
              {title}
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              {subtitle}
            </p>
          </div>

          {children}

        </div>

      </div>
    </div>
  )
}

export default AuthLayout
