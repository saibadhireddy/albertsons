export const sxStyle = {
    genieFAB: (isMobile: boolean) => ({
        position: "fixed",
        right: isMobile ? "15px" : "20px",
        bottom: isMobile ? "20px" : "30px",
        zIndex: 10000,
        width: isMobile ? "50px" : "60px",
        height: isMobile ? "50px" : "60px",
        borderRadius: "50%",
        border: "3px solid #0F172A",
        background: "linear-gradient(135deg, #6490f0ad 0%, #f355a4c0 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        boxShadow: "0 6px 16px rgba(0,0,0,0.35)", transition: "transform 0.2s ease",
        "&:hover": { transform: "scale(1.08)" },
    }),
    chatPopUp: (isChatView: boolean, isMobile: boolean) => ({
        position: "fixed",
        right: isMobile ? "0" : "20px",
        bottom: isMobile ? "20px" : "30px",
        width: isMobile ? "100%" : (isChatView ? "850px" : "380px"),
        height: isMobile ? "100%" : (isChatView ? "80vh" : "auto"),
        maxHeight: isMobile ? "100%" : "800px",
        zIndex: 10001,
        borderRadius: isMobile ? "0" : "12px",
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column" as const,
    }),
    chatTitleContainer: {
        padding: "0 8px 0 15px",
        background: "linear-gradient(to right, #2374C4, #0F2359)",
        minHeight: "60px",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleText: {
        fontSize: "16px",
        fontWeight: 600,
        color: '#fff',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '220px'
    },
    proBanner: {
        bgcolor: '#EEF4FF',
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #D0E3FF',
        gap: 2
    },
    messageChat: {
        flexGrow: 1,
        overflow: "auto",
        padding: { xs: "10px", sm: "15px" },
        backgroundColor: '#F9F9F9'
    },
    spaceItem: {
        borderBottom: '1px solid #eee',
        transition: 'all 0.2s ease',
        '&:hover': { backgroundColor: '#F0F2FF' },
        '& .MuiListItemText-primary': { fontSize: '14px', fontWeight: 600, color: '#000' },
        '& .MuiListItemText-secondary': { fontSize: '11px', color: '#64748B' }
    },
    multiAgentItem: {
        background: '#FFFBF7',
        '&:hover': { backgroundColor: '#FFF8F0' },
        borderBottom: '1px solid #eee !important',
        border: 'none',
        boxShadow: 'none',
        '& .MuiListItemText-primary': {
            fontSize: '15px',
            fontWeight: 700,
            color: '#C2410C'
        }
    },
    spaceListContainer: {
        paddingBottom: "10px",
        maxHeight: { xs: "70vh", sm: "500px" },
        minHeight: { xs: "50vh", sm: "350px" },
        overflowY: "auto" as const
    },
    textField: {
        width: "100%",
        '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' },
        "input": { padding: '12px 14px' }
    },

};