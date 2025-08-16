import CustomAuthLayoutTemplate from '@/layouts/auth/custom-auth-simple-layout';

export default function CustomAuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <CustomAuthLayoutTemplate title={title} description={description} {...props}>
            {children}
        </CustomAuthLayoutTemplate>
    );
}

