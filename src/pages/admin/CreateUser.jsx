import React, {
    useState,
    useEffect,
    useMemo,
    useRef
} from 'react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    ArrowBack,
    Save,
    Security,
    VerifiedUser,
    HelpOutline,
    Visibility,
    VisibilityOff,
    Shield,
    CheckCircle,
    Search,
    PersonAddAlt1,
    RadioButtonUnchecked,
    Business,
    Api,
    Badge
} from '@mui/icons-material';

import adminApi from '../../api/modules/admin';
import AlertMessage from '../../components/Reusable/AlertMessage';

export default function CreateUser() {

    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    const dropdownRef = useRef(null);

    /*
     * ============================================================
     * PRINCIPAL TYPE
     * ============================================================
     *
     * USER
     * API_CLIENT
     *
     */
    const [principalType, setPrincipalType] = useState('USER');

    /*
     * ============================================================
     * USER FORM
     * ============================================================
     */
    const [formData, setFormData] = useState({
        employeeId: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    /*
     * ============================================================
     * API CLIENT FORM
     * ============================================================
     */
    const [apiClientData, setApiClientData] = useState({
        organizationName: '',
        applicationName: '',
        applicationUrl: '',
        websiteUrl: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        publicLogoUrl: '',
        callbackUrl: '',
        expiresAt: ''
    });

    /*
     * ============================================================
     * ROLES
     * ============================================================
     */
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);

    /*
     * ============================================================
     * API CLIENT PERMISSIONS
     * ============================================================
     *
     * Used only when:
     *
     * principalType === 'API_CLIENT'
     *
     * and ROLE_API_CLIENT is selected.
     *
     */
    const [selectedPermissionIds, setSelectedPermissionIds] =
        useState([]);

    /*
     * ============================================================
     * EMPLOYEES
     * ============================================================
     */
    const [availableEmployees, setAvailableEmployees] = useState([]);

    // UI
    const [empSearch, setEmpSearch] = useState('');
    const [isEmpListOpen, setIsEmpListOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [showConfirm, setShowConfirm] = useState(false);

    const [alert, setAlert] = useState({
        show: false,
        type: 'info',
        message: ''
    });

    // EMPTY API CLIENT
    const emptyApiClientData = {
        organizationName: '',
        applicationName: '',
        applicationUrl: '',
        websiteUrl: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        publicLogoUrl: '',
        callbackUrl: '',
        expiresAt: ''
    };

    // PASSWORD VALIDATION
    const passwordValidation = useMemo(() => {

        const p = formData.password;

        return {
            hasMinChar: p.length >= 8,
            hasUpper: /[A-Z]/.test(p),
            hasLower: /[a-z]/.test(p),
            hasSpecial:
                /[!@#$%^&*(),.?":{}|<>]/.test(p)
        };

    }, [formData.password]);

    const isPasswordValid =
        Object.values(passwordValidation).every(Boolean);

    // ALERT
    const showAlert = (type, message) => {

        setAlert({
            show: true,
            type,
            message
        });

        if (type === 'success') {

            setTimeout(() => {

                setAlert(prev => ({
                    ...prev,
                    show: false
                }));

            }, 4000);
        }
    };

    // CLICK OUTSIDE
    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {
                setIsEmpListOpen(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, []);

    // NORMALIZE RESPONSE
    const getResponseData = (response) => {

        return response?.data ?? response;
    };

    // FORMAT DATETIME LOCAL
    const formatDateTimeLocal = (value) => {

        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const pad = (number) =>
            String(number).padStart(2, '0');

        return (
            `${date.getFullYear()}-` +
            `${pad(date.getMonth() + 1)}-` +
            `${pad(date.getDate())}T` +
            `${pad(date.getHours())}:` +
            `${pad(date.getMinutes())}`
        );
    };

    // INITIALIZATION
    useEffect(() => {

        const init = async () => {

            try {

                // LOAD ROLES
                const rolesRes =
                    await adminApi.GET_ROLES();

                const allRoles =
                    getResponseData(rolesRes) || [];

                setAvailableRoles(
                    allRoles.filter(
                        role =>
                            role.roleName !==
                            'SUPER_ADMIN'
                    )
                );

                // CREATE MODE
                if (!isEdit) {

                    const employeesRes =
                        await adminApi.GET_EMPLOYEES_NO_USER();

                    const allEmps =
                        getResponseData(
                            employeesRes
                        ) || [];

                    setAvailableEmployees(allEmps);

                    setLoading(false);

                    return;
                }

                // EDIT MODE
                const userRes =
                    await adminApi.GET_USER(id);

                const user =
                    getResponseData(userRes);

                const currentPrincipalType =
                    user.principalType || 'USER';

                setPrincipalType(
                    currentPrincipalType
                );


                // API CLIENT EDIT
                if (
                    currentPrincipalType ===
                    'API_CLIENT'
                ) {
                    const clientRes =
                        await adminApi.GET_API_CLIENT(user.apiClientId);

                    const client =
                        getResponseData(
                            clientRes
                        );

                    setPrincipalType(currentPrincipalType);

                    const account =
                        client.account ||
                        client.user ||
                        client.principal ||
                        client;

                    setFormData({
                        employeeId: '',
                        username:
                            account.username ||
                            client.username ||
                            '',
                        password: '',
                        confirmPassword: ''
                    });

                    // const loadedRoleIds =
                    //     client.roleIds ||
                    //     client.roles?.map(
                    //         role => role.id
                    //     ) ||
                    //     account.roleIds ||
                    //     account.roles?.map(
                    //         role => role.id
                    //     ) ||
                    //     [];

                    // setSelectedRoleIds(
                    //     loadedRoleIds
                    // );
                    setSelectedRoleIds(
                        user.roles?.map(
                            role => role.id
                        ) || user.roleIds || []
                    );
    
                    setSelectedPermissionIds([]);

                    setEmpSearch(
                        user.fullName || ''
                    );

                    setLoading(false);

                    /*
                     * ------------------------------------------------
                     * EXISTING API CLIENT PERMISSIONS
                     * ------------------------------------------------
                     *
                     * permissionIds now primarily live under
                     * apiClient according to ApiClientRequestDTO.
                     *
                     * We still support the older response formats
                     * so edit mode remains backward compatible.
                     */
                    const loadedPermissionIds =
                    (
                        Array.isArray(client.apiClient?.permissionIds) &&
                        client.apiClient.permissionIds.length > 0
                    )
                        ? client.apiClient.permissionIds
                
                        : (
                            Array.isArray(client.permissionIds) &&
                            client.permissionIds.length > 0
                        )
                            ? client.permissionIds
                
                            : (
                                Array.isArray(client.apiClient?.permissions) &&
                                client.apiClient.permissions.length > 0
                            )
                                ? client.apiClient.permissions.map(
                                    permission =>
                                        permission.id
                                )
                
                                : (
                                    Array.isArray(client.permissions) &&
                                    client.permissions.length > 0
                                )
                                    ? client.permissions.map(
                                        permission =>
                                            permission.id
                                    )
                
                                    : (
                                        Array.isArray(account.permissionIds) &&
                                        account.permissionIds.length > 0
                                    )
                                        ? account.permissionIds
                
                                        : (
                                            Array.isArray(account.permissions) &&
                                            account.permissions.length > 0
                                        )
                                            ? account.permissions.map(
                                                permission =>
                                                    permission.id
                                            )
                
                                            : [];

                    if (
                        Array.isArray(
                            loadedPermissionIds
                        ) &&
                        loadedPermissionIds.length > 0
                    ) {

                        setSelectedPermissionIds(
                            loadedPermissionIds
                        );
                    }

                    const apiClient =
                        client.apiClient ||
                        client;

                    setApiClientData({
                        organizationName:
                            apiClient.organizationName ||
                            '',

                        applicationName:
                            apiClient.applicationName ||
                            '',

                        applicationUrl:
                            apiClient.applicationUrl ||
                            '',

                        websiteUrl:
                            apiClient.websiteUrl ||
                            '',

                        description:
                            apiClient.description ||
                            '',

                        contactEmail:
                            apiClient.contactEmail ||
                            '',

                        contactPhone:
                            apiClient.contactPhone ||
                            '',

                        publicLogoUrl:
                            apiClient.publicLogoUrl ||
                            '',

                        callbackUrl:
                            apiClient.callbackUrl ||
                            '',

                        expiresAt:
                            formatDateTimeLocal(
                                apiClient.expiresAt
                            )
                    });

                    setLoading(false);

                    return;
                }

                // USER EDIT
                setFormData({
                    employeeId:
                        user.employeeId || '',

                    username:
                        user.username || '',

                    password: '',
                    confirmPassword: ''
                });

                setSelectedRoleIds(
                    user.roles?.map(
                        role => role.id
                    ) || user.roleIds || []
                );

                setSelectedPermissionIds([]);

                setEmpSearch(
                    user.fullName || ''
                );

                setLoading(false);

            } catch (err) {

                console.error(
                    'CreateUser initialization error:',
                    err
                );

                showAlert(
                    'error',
                    err.response?.data?.message ||
                    'Initialization failed: Registry sync error.'
                );

                setLoading(false);
            }
        };

        init();

    }, [id, isEdit]);

    // API CLIENT ROLE
    const selectedRoles = useMemo(() => {

        return availableRoles.filter(
            role =>
                selectedRoleIds.includes(
                    role.id
                )
        );

    }, [
        availableRoles,
        selectedRoleIds
    ]);

    const hasApiClientRole = useMemo(() => {

        return selectedRoles.some(
            role =>
                role.roleName ===
                'ROLE_API_CLIENT'
        );

    }, [selectedRoles]);

    // API CLIENT ROLE PERMISSIONS
    const apiClientRolePermissions = useMemo(() => {

        if (
            principalType !==
            'API_CLIENT'
        ) {
            return [];
        }

        const apiClientRole =
            availableRoles.find(
                role =>
                    role.roleName ===
                    'ROLE_API_CLIENT'
            );

        if (
            !apiClientRole ||
            !Array.isArray(
                apiClientRole.permissions
            )
        ) {
            return [];
        }

        const seen = new Set();

        return apiClientRole.permissions.filter(
            permission => {

                const identifier =
                    permission.id ||
                    permission.slug;

                if (
                    !identifier ||
                    seen.has(identifier)
                ) {
                    return false;
                }

                seen.add(identifier);

                return true;
            }
        ).sort(
            (a, b) =>
                (
                    a.name ||
                    a.slug ||
                    ''
                ).localeCompare(
                    b.name ||
                    b.slug ||
                    ''
                )
        );

    }, [
        principalType,
        availableRoles
    ]);

    /*
     * ============================================================
     * SYNC API CLIENT PERMISSIONS
     * ============================================================
     */
    useEffect(() => {

        if (
            principalType !==
            'API_CLIENT'
        ) {

            setSelectedPermissionIds([]);

            return;
        }

        if (!hasApiClientRole) {

            setSelectedPermissionIds([]);

            return;
        }

        if (
            apiClientRolePermissions.length === 0
        ) {
            setSelectedPermissionIds([]);

            return;
        }

        setSelectedPermissionIds(prev => {

            /*
             * If permissions were already loaded from the
             * backend, preserve them.
             */
            if (
                prev.length > 0
            ) {

                const validPermissionIds =
                    apiClientRolePermissions.map(
                        permission =>
                            permission.id
                    );

                return prev.filter(
                    permissionId =>
                        validPermissionIds.includes(
                            permissionId
                        )
                );
            }

            // /*
            //  * Otherwise select all permissions by default.
            //  */
            // return apiClientRolePermissions.map(
            //     permission =>
            //         permission.id
            // );

            
            /*
            * Otherwise leave permissions deselected by default.
            */
            return [];


        });

    }, [
        principalType,
        hasApiClientRole,
        apiClientRolePermissions
    ]);

    /*
     * ============================================================
     * PRINCIPAL TYPE CHANGE
     * ============================================================
     */
    const handlePrincipalTypeChange = (type) => {

        if (isEdit) {
            return;
        }

        setPrincipalType(type);

        /*
         * --------------------------------------------------------
         * USER
         * --------------------------------------------------------
         */
        if (type === 'USER') {

            setApiClientData({
                ...emptyApiClientData
            });

            setSelectedPermissionIds([]);

            return;
        }

        /*
         * --------------------------------------------------------
         * API CLIENT
         * --------------------------------------------------------
         */
        setFormData(prev => ({
            ...prev,
            employeeId: '',
            username: ''
        }));

        setEmpSearch('');

        setSelectedRoleIds([]);

        setSelectedPermissionIds([]);
    };

    /*
     * ============================================================
     * EMPLOYEE SELECTION
     * ============================================================
     */
    const selectEmployee = (emp) => {

        const names =
            emp.fullName
                .toLowerCase()
                .trim()
                .split(/\s+/);

        const suggestedUsername =
            names.join('');

        setFormData(prev => ({
            ...prev,
            employeeId: emp.id,
            username: suggestedUsername
        }));

        setEmpSearch(emp.fullName);

        setIsEmpListOpen(false);
    };

    /*
     * ============================================================
     * EMPLOYEE FILTER
     * ============================================================
     */
    const filteredEmployees = useMemo(() => {

        if (isEdit) {
            return [];
        }

        if (!empSearch.trim()) {

            return availableEmployees.slice(
                0,
                8
            );
        }

        return availableEmployees.filter(
            emp =>
                emp.fullName
                    .toLowerCase()
                    .includes(
                        empSearch.toLowerCase()
                    )
        );

    }, [
        availableEmployees,
        empSearch,
        isEdit
    ]);

    /*
     * ============================================================
     * NORMAL FORM CHANGE
     * ============================================================
     */
    const handleInputChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /*
     * ============================================================
     * API CLIENT FORM CHANGE
     * ============================================================
     */
    const handleApiClientChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setApiClientData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /*
     * ============================================================
     * ROLE SELECTION
     * ============================================================
     */
    const toggleRole = (roleId) => {

        setSelectedRoleIds(prev => {

            const isCurrentlySelected =
                prev.includes(roleId);

            const nextRoleIds =
                isCurrentlySelected

                    ? prev.filter(
                        id =>
                            id !== roleId
                    )

                    : [
                        ...prev,
                        roleId
                    ];

            /*
             * ----------------------------------------------------
             * API CLIENT ROLE PERMISSION HANDLING
             * ----------------------------------------------------
             */
            if (
                principalType ===
                'API_CLIENT'
            ) {

                const role =
                    availableRoles.find(
                        item =>
                            item.id ===
                            roleId
                    );

                // if (
                //     role?.roleName ===
                //     'ROLE_API_CLIENT'
                // ) {

                //     if (
                //         isCurrentlySelected
                //     ) {

                //         setSelectedPermissionIds([]);

                //     } else {

                //         const permissionIds =
                //             Array.isArray(
                //                 role.permissions
                //             )
                //                 ? role.permissions
                //                     .map(
                //                         permission =>
                //                             permission.id
                //                     )
                //                     .filter(Boolean)
                //                 : [];

                        
                //         setSelectedPermissionIds(
                //             permissionIds
                //         );
                //     }
                // }
                if (
                    role?.roleName === 'ROLE_API_CLIENT'
                ) {
                
                    if (isCurrentlySelected) {
                
                        setSelectedPermissionIds([]);
                
                    } else {
                
                        /*
                         * ROLE_API_CLIENT is required for API clients,
                         * but its permissions must be explicitly selected
                         * by the administrator.
                         */
                        setSelectedPermissionIds([]);
                
                    }
                }                
                
            }

            return nextRoleIds;
        });
    };

    /*
     * ============================================================
     * PERMISSION SELECTION
     * ============================================================
     */
    const togglePermission = (permissionId) => {

        if (
            principalType !==
            'API_CLIENT'
        ) {
            return;
        }

        if (!hasApiClientRole) {
            return;
        }

        setSelectedPermissionIds(prev =>

            prev.includes(permissionId)

                ? prev.filter(
                    id =>
                        id !== permissionId
                )

                : [
                    ...prev,
                    permissionId
                ]
        );
    };

    /*
     * ============================================================
     * EFFECTIVE ROLE PERMISSIONS
     * ============================================================
     */
    const effectivePermissions = useMemo(() => {

        if (
            principalType ===
            'API_CLIENT' &&
            hasApiClientRole
        ) {

            return apiClientRolePermissions.filter(
                permission =>
                    selectedPermissionIds.includes(
                        permission.id
                    )
            );
        }

        const allPerms = [];
        const seen = new Set();

        selectedRoleIds.forEach(roleId => {

            const role =
                availableRoles.find(
                    r => r.id === roleId
                );

            if (
                role &&
                role.permissions
            ) {

                role.permissions.forEach(
                    permission => {

                        const identifier =
                            permission.id ||
                            permission.slug;

                        if (
                            !seen.has(
                                identifier
                            )
                        ) {

                            seen.add(
                                identifier
                            );

                            allPerms.push(
                                permission
                            );
                        }

                    }
                );
            }
        });

        return allPerms.sort(
            (a, b) =>
                (
                    a.name ||
                    a.slug ||
                    ''
                ).localeCompare(
                    b.name ||
                    b.slug ||
                    ''
                )
        );

    }, [
        principalType,
        hasApiClientRole,
        apiClientRolePermissions,
        selectedPermissionIds,
        selectedRoleIds,
        availableRoles
    ]);

    /*
     * ============================================================
     * URL VALIDATION
     * ============================================================
     */
    const validateOptionalUrl = (
        value,
        label
    ) => {

        if (!value.trim()) {
            return true;
        }

        try {

            const url =
                new URL(
                    value.trim()
                );

            if (
                ![
                    'http:',
                    'https:'
                ].includes(
                    url.protocol
                )
            ) {
                throw new Error(
                    'Invalid protocol'
                );
            }

            return true;

        } catch {

            showAlert(
                'error',
                `Validation Error: ${label} must be a valid HTTP/HTTPS URL.`
            );

            return false;
        }
    };

    /*
     * ============================================================
     * API CLIENT VALIDATION
     * ============================================================
     */
    const validateApiClient = () => {

        const {
            organizationName,
            applicationName,
            contactEmail,
            applicationUrl,
            websiteUrl,
            callbackUrl
        } = apiClientData;

        if (
            !organizationName.trim()
        ) {

            showAlert(
                'error',
                'Validation Error: Organization name is required.'
            );

            return false;
        }

        if (
            !applicationName.trim()
        ) {

            showAlert(
                'error',
                'Validation Error: Application name is required.'
            );

            return false;
        }

        if (
            !contactEmail.trim()
        ) {

            showAlert(
                'error',
                'Validation Error: Contact email is required.'
            );

            return false;
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(
                    contactEmail.trim()
                )
        ) {

            showAlert(
                'error',
                'Validation Error: Contact email is invalid.'
            );

            return false;
        }

        if (
            !validateOptionalUrl(
                applicationUrl,
                'Application URL'
            )
        ) {
            return false;
        }

        if (
            !validateOptionalUrl(
                websiteUrl,
                'Website URL'
            )
        ) {
            return false;
        }

        if (
            !validateOptionalUrl(
                callbackUrl,
                'Callback URL'
            )
        ) {
            return false;
        }

        if (
            apiClientData.expiresAt
        ) {

            const expiresAt =
                new Date(
                    apiClientData.expiresAt
                );

            if (
                Number.isNaN(
                    expiresAt.getTime()
                )
            ) {

                showAlert(
                    'error',
                    'Validation Error: Invalid expiration date.'
                );

                return false;
            }

            if (
                expiresAt <= new Date()
            ) {

                showAlert(
                    'error',
                    'Validation Error: Expiration date must be in the future.'
                );

                return false;
            }
        }

        return true;
    };

    /*
     * ============================================================
     * SAVE VALIDATION
     * ============================================================
     */
    const handleSaveTrigger = () => {

        const {
            employeeId,
            username,
            password,
            confirmPassword
        } = formData;

        /*
         * --------------------------------------------------------
         * USER
         * --------------------------------------------------------
         */
        if (
            principalType === 'USER'
        ) {

            if (
                !isEdit &&
                !employeeId
            ) {

                showAlert(
                    'error',
                    'Validation Error: Please select an employee.'
                );

                return;
            }

            if (
                !username.trim()
            ) {

                showAlert(
                    'error',
                    'Validation Error: Username is required.'
                );

                return;
            }
        }

        /*
         * --------------------------------------------------------
         * API CLIENT
         * --------------------------------------------------------
         */
        if (
            principalType ===
            'API_CLIENT'
        ) {

            if (
                !validateApiClient()
            ) {
                return;
            }

            if (
                !username.trim()
            ) {

                showAlert(
                    'error',
                    'Validation Error: API client username is required.'
                );

                return;
            }
        }

        /*
         * --------------------------------------------------------
         * PASSWORD
         * --------------------------------------------------------
         */
        const isTypingPassword =
            password.length > 0;

        if (
            !isEdit ||
            isTypingPassword
        ) {

            if (
                !isEdit &&
                !isTypingPassword
            ) {

                showAlert(
                    'error',
                    'Security Error: Password is required for new accounts.'
                );

                return;
            }

            if (
                isTypingPassword &&
                !isPasswordValid
            ) {

                showAlert(
                    'error',
                    'Security Policy: Password does not meet complexity requirements.'
                );

                return;
            }

            if (
                password !==
                confirmPassword
            ) {

                showAlert(
                    'error',
                    'Validation Error: Passwords do not match.'
                );

                return;
            }
        }

        /*
         * --------------------------------------------------------
         * ROLE
         * --------------------------------------------------------
         */
        if (
            selectedRoleIds.length === 0
        ) {

            showAlert(
                'error',
                'Authorization Error: At least one functional role must be assigned.'
            );

            return;
        }

        /*
         * --------------------------------------------------------
         * API CLIENT ROLE
         * --------------------------------------------------------
         */
        if (
            principalType ===
            'API_CLIENT'
        ) {

            if (
                !hasApiClientRole
            ) {

                showAlert(
                    'error',
                    'Authorization Error: API clients must have ROLE_API_CLIENT.'
                );

                return;
            }

            if (
                apiClientRolePermissions.length > 0 &&
                selectedPermissionIds.length === 0
            ) {

                showAlert(
                    'error',
                    'Authorization Error: Select at least one API client permission.'
                );

                return;
            }
        }

        setShowConfirm(true);
    };

    /*
     * ============================================================
     * BUILD USER PAYLOAD
     * ============================================================
     */
    const buildUserPayload = () => {

        const payload = {
            principalType: 'USER',

            username:
                formData.username.trim(),

            roleIds:
                selectedRoleIds,

            employeeId:
                formData.employeeId
        };

        if (
            formData.password.trim()
        ) {

            payload.password =
                formData.password.trim();
        }

        return payload;
    };

    /*
     * ============================================================
     * BUILD API CLIENT PAYLOAD
     * ============================================================
     *
     * IMPORTANT:
     *
     * permissionIds belongs to apiClient according to:
     *
     * ApiClientRequestDTO
     *
     * It is NOT a top-level field of:
     *
     * ApiClientPrincipalRequestDTO
     *
     * Therefore:
     *
     * API_CLIENT + ROLE_API_CLIENT
     *
     * produces:
     *
     * {
     *     principalType: "API_CLIENT",
     *     username: "...",
     *     roleIds: [...],
     *     apiClient: {
     *         ...,
     *         permissionIds: [...]
     *     }
     * }
     *
     * No top-level permissionIds is sent.
     */
    const buildApiClientPayload = () => {

        const payload = {

            principalType: 'API_CLIENT',

            username:
                formData.username.trim(),

            roleIds:
                selectedRoleIds,

            apiClient: {

                organizationName:
                    apiClientData
                        .organizationName
                        .trim(),

                applicationName:
                    apiClientData
                        .applicationName
                        .trim(),

                applicationUrl:
                    apiClientData
                        .applicationUrl
                        .trim() ||
                    null,

                websiteUrl:
                    apiClientData
                        .websiteUrl
                        .trim() ||
                    null,

                description:
                    apiClientData
                        .description
                        .trim() ||
                    null,

                contactEmail:
                    apiClientData
                        .contactEmail
                        .trim()
                        .toLowerCase(),

                contactPhone:
                    apiClientData
                        .contactPhone
                        .trim() ||
                    null,

                publicLogoUrl:
                    apiClientData
                        .publicLogoUrl
                        .trim() ||
                    null,

                callbackUrl:
                    apiClientData
                        .callbackUrl
                        .trim() ||
                    null,

                expiresAt:
                    apiClientData.expiresAt
                        ? new Date(
                            apiClientData
                                .expiresAt
                        ).toISOString()
                        : null
            }
        };

        /*
         * ========================================================
         * IMPORTANT FIX
         * ========================================================
         *
         * permissionIds MUST be inside apiClient.
         *
         * Only add it when:
         *
         * 1. Principal type is API_CLIENT
         * 2. ROLE_API_CLIENT is selected
         *
         * hasApiClientRole already represents condition #2.
         *
         * Do NOT add permissionIds to the root payload.
         */
        if (
            principalType === 'API_CLIENT' &&
            hasApiClientRole
        ) {

            payload.apiClient.permissionIds =
                selectedPermissionIds;
        }

        /*
         * Password is optional during edit.
         */
        if (
            formData.password.trim()
        ) {

            payload.password =
                formData.password.trim();
        }

        return payload;
    };

    /*
     * ============================================================
     * SAVE
     * ============================================================
     */
    const executeSave = async () => {

        setShowConfirm(false);
        setSaving(true);

        try {

            /*
             * ====================================================
             * USER ENDPOINT
             * ====================================================
             */
            if (
                principalType === 'USER'
            ) {

                const payload =
                    buildUserPayload();

                if (isEdit) {

                    
                    await adminApi.UPDATE_USER(
                        id,
                        payload
                    );

                    showAlert(
                        'success',
                        'User profile updated.'
                    );

                } else {

                    await adminApi.CREATE_USER(
                        payload
                    );

                    showAlert(
                        'success',
                        'User account established.'
                    );
                }
            }

            /*
             * ====================================================
             * API CLIENT ENDPOINT
             * ====================================================
             */
            else if (
                principalType ===
                'API_CLIENT'
            ) {

                const payload =
                    buildApiClientPayload();

                /*
                 * This is useful while verifying the exact
                 * structure sent to Spring Boot.
                 */

                if (isEdit) {

                    await adminApi.UPDATE_API_CLIENT
                    (
                        id,
                        payload
                    );

                    showAlert(
                        'success',
                        'API client account updated.'
                    );

                } else {

                    await adminApi.CREATE_API_CLIENT(
                        payload
                    );

                    showAlert(
                        'success',
                        'API client account established.'
                    );
                }
            }

            /*
             * ====================================================
             * UNKNOWN PRINCIPAL TYPE
             * ====================================================
             */
            else {

                throw new Error(
                    `Unsupported principal type: ${principalType}`
                );
            }

            /*
             * Navigate after successful transaction.
             */
            setTimeout(
                () =>
                    navigate(
                        '/admin/users'
                    ),
                1500
            );

        } catch (err) {

            console.error(
                'Account save error:',
                err
            );

            showAlert(
                'error',
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Transaction failed.'
            );

        } finally {

            setSaving(false);
        }
    };

    /*
     * ============================================================
     * PASSWORD REQUIREMENT
     * ============================================================
     */
    const Requirement = ({
        met,
        label
    }) => (

        <div
            className={`flex items-center gap-1.5 transition-colors ${
                met
                    ? 'text-emerald-600'
                    : 'text-slate-400'
            }`}
        >

            {met

                ? (
                    <CheckCircle
                        style={{
                            fontSize: 12
                        }}
                    />
                )

                : (
                    <RadioButtonUnchecked
                        style={{
                            fontSize: 12
                        }}
                    />
                )
            }

            <span className="text-[10px] font-bold uppercase tracking-tight">
                {label}
            </span>

        </div>
    );

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */
    if (loading) {

        return (
            <div className="p-10 text-center text-slate-400 italic animate-pulse">
                Synchronizing Identity Matrix...
            </div>
        );
    }

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */
    return (

        <div className="w-full space-y-4 pb-10 px-2 relative animate-fadeIn">

            {/* =====================================================
                CONFIRM MODAL
            ====================================================== */}

            {showConfirm && (

                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">

                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-slate-100">

                        <HelpOutline
                            className="text-[#0284C7] mb-4 mx-auto"
                            style={{
                                fontSize: 48
                            }}
                        />

                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                            Confirm Save
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">

                            Commit settings for{' '}

                            <b>
                                {formData.username}
                            </b>

                            ?

                        </p>

                        <div className="flex gap-3 mt-8">

                            <button
                                onClick={() =>
                                    setShowConfirm(
                                        false
                                    )
                                }
                                className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={executeSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-[10px] uppercase shadow-lg transition-all disabled:opacity-50"
                            >
                                {saving
                                    ? 'Saving...'
                                    : 'Confirm'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            <AlertMessage
                show={alert.show}
                type={alert.type}
                message={alert.message}
                onClose={() =>
                    setAlert(prev => ({
                        ...prev,
                        show: false
                    }))
                }
            />

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        onClick={() =>
                            navigate(
                                '/admin/users'
                            )
                        }
                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <ArrowBack fontSize="small" />
                    </button>

                    <div>

                        <h1 className="text-base font-bold text-slate-900 leading-none">

                            {isEdit

                                ? principalType ===
                                    'API_CLIENT'
                                    ? 'Edit API Client'
                                    : 'Edit User'

                                : principalType ===
                                    'API_CLIENT'
                                    ? 'Create API Client'
                                    : 'Create User'
                            }

                        </h1>

                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                            Access Mapping Panel
                        </p>

                    </div>

                </div>

                <button
                    onClick={handleSaveTrigger}
                    disabled={saving}
                    className="bg-[#0284C7] text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-[#0369a1] active:scale-95 transition-all shadow-md disabled:opacity-50 tracking-widest uppercase"
                >

                    <Save
                        style={{
                            fontSize: 16
                        }}
                    />

                    {saving

                        ? 'SAVING...'

                        : isEdit
                            ? 'UPDATE ACCOUNT'
                            : 'SAVE ACCOUNT'
                    }

                </button>

            </div>

            {/* =====================================================
                PRINCIPAL TYPE
            ====================================================== */}

            {(

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

                    <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">

                        <Badge
                            className="text-slate-400"
                            fontSize="small"
                        />

                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                            Principal Type
                        </span>

                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">

                        {/* USER */}

                        <div
                            onClick={() =>
                                handlePrincipalTypeChange(
                                    'USER'
                                )
                            }
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                principalType ===
                                'USER'
                                    ? 'border-[#FBAF1E] bg-amber-50/30 shadow-sm'
                                    : 'border-slate-100 bg-white hover:border-slate-300'
                            }`}
                        >

                            <div className="flex items-center gap-3">

                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        principalType ===
                                        'USER'
                                            ? 'bg-[#FBAF1E] text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}
                                >

                                    <PersonAddAlt1
                                        style={{
                                            fontSize: 16
                                        }}
                                    />

                                </div>

                                <div>

                                    <p className="text-xs font-bold text-slate-700 uppercase">
                                        User
                                    </p>

                                    <p className="text-[9px] text-slate-400 italic">
                                        Employee account
                                    </p>

                                </div>

                                {principalType ===
                                    'USER' && (

                                    <CheckCircle
                                        className="ml-auto text-[#FBAF1E]"
                                        fontSize="small"
                                    />

                                )}

                            </div>

                        </div>

                        {/* API CLIENT */}

                        <div
                            onClick={() =>
                                handlePrincipalTypeChange(
                                    'API_CLIENT'
                                )
                            }
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                principalType ===
                                'API_CLIENT'
                                    ? 'border-[#FBAF1E] bg-amber-50/30 shadow-sm'
                                    : 'border-slate-100 bg-white hover:border-slate-300'
                            }`}
                        >

                            <div className="flex items-center gap-3">

                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        principalType ===
                                        'API_CLIENT'
                                            ? 'bg-[#FBAF1E] text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}
                                >

                                    <Api
                                        style={{
                                            fontSize: 16
                                        }}
                                    />

                                </div>

                                <div>

                                    <p className="text-xs font-bold text-slate-700 uppercase">
                                        API Client
                                    </p>

                                    <p className="text-[9px] text-slate-400 italic">
                                        System-to-system integration
                                    </p>

                                </div>

                                {principalType ===
                                    'API_CLIENT' && (

                                    <CheckCircle
                                        className="ml-auto text-[#FBAF1E]"
                                        fontSize="small"
                                    />

                                )}

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* =====================================================
                MAIN GRID
            ====================================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* =================================================
                    ACCOUNT DETAILS
                ================================================== */}

                <div className="lg:col-span-4 space-y-4">

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-full pb-5">

                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">

                            {principalType ===
                                'API_CLIENT'

                                ? (
                                    <Business
                                        className="text-slate-400"
                                        fontSize="small"
                                    />
                                )

                                : (
                                    <PersonAddAlt1
                                        className="text-slate-400"
                                        fontSize="small"
                                    />
                                )
                            }

                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">

                                {principalType ===
                                    'API_CLIENT'
                                    ? 'API Client Details'
                                    : 'Account Details'}

                            </span>

                        </div>

                        <div className="p-5 space-y-4">

                            {/* USER EMPLOYEE SEARCH */}

                            {principalType ===
                                'USER' && (

                                <div
                                    className="relative"
                                    ref={dropdownRef}
                                >

                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                        Search Employee
                                    </label>

                                    <div className="relative">

                                        <Search
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            style={{
                                                fontSize: 16
                                            }}
                                        />

                                        <input
                                            type="text"
                                            placeholder="Type name to select..."
                                            value={empSearch}
                                            onChange={(e) => {

                                                setEmpSearch(
                                                    e.target.value
                                                );

                                                setIsEmpListOpen(
                                                    true
                                                );

                                            }}
                                            onFocus={() =>
                                                !isEdit &&
                                                setIsEmpListOpen(
                                                    true
                                                )
                                            }
                                            disabled={isEdit}
                                            className={`w-full pl-10 pr-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0284C7] transition-all ${
                                                isEdit
                                                    ? 'opacity-60 cursor-not-allowed'
                                                    : ''
                                            }`}
                                        />

                                    </div>

                                    {isEmpListOpen &&
                                        !isEdit && (

                                        <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">

                                            {filteredEmployees.length >
                                            0

                                                ? filteredEmployees.map(
                                                    emp => (

                                                        <div
                                                            key={
                                                                emp.id
                                                            }
                                                            onClick={() =>
                                                                selectEmployee(
                                                                    emp
                                                                )
                                                            }
                                                            className="p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                                                        >

                                                            <p className="text-xs font-bold text-slate-700">
                                                                {
                                                                    emp.fullName
                                                                }
                                                            </p>

                                                            <p className="text-[9px] text-slate-400 uppercase tracking-tighter">

                                                                {
                                                                    emp.positionName
                                                                }

                                                                {' — '}

                                                                {
                                                                    emp.divisionName
                                                                }

                                                            </p>

                                                        </div>

                                                    )
                                                )

                                                : (

                                                    <div className="p-4 text-center text-slate-400 text-xs italic">
                                                        No match found
                                                    </div>

                                                )}

                                        </div>
                                    )}

                                </div>
                            )}

                            {/* API CLIENT */}

                            {principalType ===
                                'API_CLIENT' && (

                                <>

                                    <div>

                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                            Organization Name
                                        </label>

                                        <input
                                            name="organizationName"
                                            value={
                                                apiClientData.organizationName
                                            }
                                            onChange={
                                                handleApiClientChange
                                            }
                                            placeholder="ABC Company"
                                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                        />

                                    </div>

                                    <div>

                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                            Application Name
                                        </label>

                                        <input
                                            name="applicationName"
                                            value={
                                                apiClientData.applicationName
                                            }
                                            onChange={
                                                handleApiClientChange
                                            }
                                            placeholder="ABC ERP"
                                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                        />

                                    </div>

                                    <div className="grid grid-cols-2 gap-3">

                                        <div>

                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                                Contact Email
                                            </label>

                                            <input
                                                type="email"
                                                name="contactEmail"
                                                value={
                                                    apiClientData.contactEmail
                                                }
                                                onChange={
                                                    handleApiClientChange
                                                }
                                                placeholder="admin@abc.com"
                                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                            />

                                        </div>

                                        <div>

                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                                Contact Phone
                                            </label>

                                            <input
                                                name="contactPhone"
                                                value={
                                                    apiClientData.contactPhone
                                                }
                                                onChange={
                                                    handleApiClientChange
                                                }
                                                placeholder="+251..."
                                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                            />

                                        </div>

                                    </div>

                                    <div>

                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                            Application URL
                                        </label>

                                        <input
                                            name="applicationUrl"
                                            value={
                                                apiClientData.applicationUrl
                                            }
                                            onChange={
                                                handleApiClientChange
                                            }
                                            placeholder="https://erp.example.com"
                                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                        />

                                    </div>

                                    <div>

                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                            Website URL
                                        </label>

                                        <input
                                            name="websiteUrl"
                                            value={
                                                apiClientData.websiteUrl
                                            }
                                            onChange={
                                                handleApiClientChange
                                            }
                                            placeholder="https://example.com"
                                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                        />

                                    </div>

                                    <div>

                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                            Callback URL
                                        </label>

                                        <input
                                            name="callbackUrl"
                                            value={
                                                apiClientData.callbackUrl
                                            }
                                            onChange={
                                                handleApiClientChange
                                            }
                                            placeholder="https://erp.example.com/oauth/callback"
                                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                        />

                                    </div>

                                    <div>

                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                            Expiration
                                        </label>

                                        <input
                                            type="datetime-local"
                                            name="expiresAt"
                                            value={
                                                apiClientData.expiresAt
                                            }
                                            onChange={
                                                handleApiClientChange
                                            }
                                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                        />

                                    </div>

                                    <div>

                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                apiClientData.description
                                            }
                                            onChange={
                                                handleApiClientChange
                                            }
                                            rows={3}
                                            placeholder="Describe this integration..."
                                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all resize-none"
                                        />

                                    </div>

                                </>
                            )}

                            {/* USERNAME */}

                            <div>

                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                    Username
                                </label>

                                <input
                                    name="username"
                                    value={
                                        formData.username
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder={
                                        principalType ===
                                        'API_CLIENT'
                                            ? 'api_abc_erp'
                                            : 'username'
                                    }
                                    className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0284C7] transition-all"
                                />

                            </div>

                            {/* PASSWORD */}

                            <div className="relative">

                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">

                                    Password{' '}

                                    {isEdit &&
                                        '(Leave empty to keep)'}

                                </label>

                                <input
                                    name="password"
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#0284C7] transition-all"
                                    placeholder={
                                        isEdit
                                            ? '••••••••'
                                            : 'Enter password'
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3 top-9 text-slate-400"
                                >

                                    {showPassword

                                        ? (
                                            <VisibilityOff
                                                fontSize="small"
                                            />
                                        )

                                        : (
                                            <Visibility
                                                fontSize="small"
                                            />
                                        )}

                                </button>

                                {(formData.password ||
                                    !isEdit) && (

                                    <div className="mt-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 animate-fadeIn">

                                        <Requirement
                                            met={
                                                passwordValidation.hasMinChar
                                            }
                                            label="8+ Characters"
                                        />

                                        <Requirement
                                            met={
                                                passwordValidation.hasUpper
                                            }
                                            label="1 Uppercase"
                                        />

                                        <Requirement
                                            met={
                                                passwordValidation.hasLower
                                            }
                                            label="1 Lowercase"
                                        />

                                        <Requirement
                                            met={
                                                passwordValidation.hasSpecial
                                            }
                                            label="1 Symbol"
                                        />

                                    </div>
                                )}

                            </div>

                            {/* CONFIRM PASSWORD */}

                            <div className="relative">

                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-widest">
                                    Confirm Password
                                </label>

                                <input
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    className={`w-full text-sm font-semibold bg-slate-50 border rounded-xl px-3 py-2.5 outline-none transition-all ${
                                        formData.confirmPassword &&
                                        formData.password !==
                                            formData.confirmPassword
                                            ? 'border-rose-300 focus:border-rose-400'
                                            : 'border-slate-200 focus:border-[#0284C7]'
                                    }`}
                                    placeholder="Repeat password"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-9 text-slate-400"
                                >

                                    {showConfirmPassword

                                        ? (
                                            <VisibilityOff
                                                fontSize="small"
                                            />
                                        )

                                        : (
                                            <Visibility
                                                fontSize="small"
                                            />
                                        )}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    ROLES
                ================================================== */}

                <div className="lg:col-span-4 space-y-4">

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden">

                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">

                            <Security
                                className="text-slate-400"
                                fontSize="small"
                            />

                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                                Available Roles
                            </span>

                        </div>

                        <div className="p-4 space-y-2 max-h-[550px] overflow-y-auto no-scrollbar">

                            {availableRoles.map(
                                role => (

                                    <div
                                        key={
                                            role.id
                                        }
                                        onClick={() =>
                                            toggleRole(
                                                role.id
                                            )
                                        }
                                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                            selectedRoleIds.includes(
                                                role.id
                                            )
                                                ? 'border-[#FBAF1E] bg-amber-50/30 shadow-sm'
                                                : 'border-slate-100 bg-white hover:border-slate-300'
                                        }`}
                                    >

                                        <div className="flex items-center justify-between">

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                        selectedRoleIds.includes(
                                                            role.id
                                                        )
                                                            ? 'bg-[#FBAF1E] text-white shadow-sm'
                                                            : 'bg-slate-100 text-slate-400'
                                                    }`}
                                                >

                                                    <VerifiedUser
                                                        style={{
                                                            fontSize: 16
                                                        }}
                                                    />

                                                </div>

                                                <div>

                                                    <p className="text-xs font-bold text-slate-700 uppercase leading-tight">
                                                        {
                                                            role.roleName
                                                        }
                                                    </p>

                                                    <p className="text-[9px] text-slate-400 truncate max-w-[150px] italic">
                                                        {
                                                            role.description
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                            {selectedRoleIds.includes(
                                                role.id
                                            ) && (

                                                <CheckCircle
                                                    className="text-[#FBAF1E]"
                                                    fontSize="small"
                                                />

                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

                {/* =================================================
                    PRIVILEGES
                ================================================== */}

                <div className="lg:col-span-4 space-y-4">

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden">

                        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">

                            <Shield
                                className="text-slate-400"
                                fontSize="small"
                            />

                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">

                                {principalType ===
                                    'API_CLIENT'
                                    ? 'Role Privileges'
                                    : 'Privileges Preview'}

                            </span>

                        </div>

                        <div className="p-4 max-h-[550px] overflow-y-auto no-scrollbar">

                            {/* =================================================
                                API CLIENT + ROLE_API_CLIENT
                                CHECKBOX PERMISSIONS
                            ================================================== */}

                            {principalType ===
                                'API_CLIENT' &&
                                hasApiClientRole ? (

                                apiClientRolePermissions.length ===
                                0 ? (

                                    <div className="text-center py-20 opacity-40">

                                        <Shield
                                            className="text-slate-300 mb-2"
                                            fontSize="large"
                                        />

                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                            No permissions available
                                        </p>

                                    </div>

                                ) : (

                                    <div className="space-y-2 animate-fadeIn">

                                        <div className="mb-3 px-2 py-1 bg-sky-50 rounded border border-sky-100 text-[10px] font-bold text-sky-700 uppercase text-center tracking-widest">

                                            {
                                                selectedPermissionIds.length
                                            }

                                            {' / '}

                                            {
                                                apiClientRolePermissions.length
                                            }

                                            {' '}

                                            Permissions Selected

                                        </div>

                                        {apiClientRolePermissions.map(
                                            perm => {

                                                const permissionId =
                                                    perm.id;

                                                const isSelected =
                                                    selectedPermissionIds.includes(
                                                        permissionId
                                                    );

                                                return (

                                                    <label
                                                        key={
                                                            permissionId ||
                                                            perm.slug
                                                        }
                                                        className={`p-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
                                                            isSelected
                                                                ? 'bg-sky-50 border border-sky-200'
                                                                : 'bg-slate-50 border border-slate-100 hover:border-slate-200'
                                                        }`}
                                                    >

                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                isSelected
                                                            }
                                                            onChange={() =>
                                                                togglePermission(
                                                                    permissionId
                                                                )
                                                            }
                                                            className="w-4 h-4 accent-[#0284C7] cursor-pointer"
                                                        />

                                                        <div className="flex-1 min-w-0">

                                                            <p className="text-[11px] font-bold text-slate-700 capitalize">

                                                                {perm.name

                                                                    ?.toLowerCase()

                                                                    .replace(
                                                                        /_/g,
                                                                        ' '
                                                                    )

                                                                    ||
                                                                    perm.slug}

                                                            </p>

                                                            {perm.description && (

                                                                <p className="text-[9px] text-slate-400 mt-0.5 truncate">

                                                                    {
                                                                        perm.description
                                                                    }

                                                                </p>

                                                            )}

                                                        </div>

                                                        {isSelected && (

                                                            <CheckCircle
                                                                className="text-[#0284C7]"
                                                                style={{
                                                                    fontSize: 16
                                                                }}
                                                            />

                                                        )}

                                                    </label>

                                                );
                                            }
                                        )}

                                    </div>

                                )

                            ) : effectivePermissions.length ===
                              0 ? (

                                <div className="text-center py-20 opacity-40">

                                    <Shield
                                        className="text-slate-300 mb-2"
                                        fontSize="large"
                                    />

                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">

                                        {principalType ===
                                            'API_CLIENT'
                                            ? 'Select ROLE_API_CLIENT'
                                            : 'Select roles to review'}

                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-2 animate-fadeIn">

                                    <div className="mb-3 px-2 py-1 bg-sky-50 rounded border border-sky-100 text-[10px] font-bold text-sky-700 uppercase text-center tracking-widest">

                                        {
                                            effectivePermissions.length
                                        }

                                        {' '}

                                        Capabilities

                                    </div>

                                    {effectivePermissions.map(
                                        perm => (

                                            <div
                                                key={
                                                    perm.id ||
                                                    perm.slug
                                                }
                                                className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2"
                                            >

                                                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full" />

                                                <p className="text-[11px] font-bold text-slate-700 capitalize">

                                                    {perm.name

                                                        ?.toLowerCase()

                                                        .replace(
                                                            /_/g,
                                                            ' '
                                                        )

                                                        ||
                                                        perm.slug}

                                                </p>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}